export type PincodeInfo = {
  city: string;
  district: string;
  state: string;
};

type PostOffice = {
  Name?: string;
  District?: string;
  State?: string;
};
type ApiResponse = Array<{ Status?: string; PostOffice?: PostOffice[] | null }>;

const cache = new Map<string, PincodeInfo | null>();
const inflight = new Map<string, Promise<PincodeInfo | null>>();

function cleanPostOfficeName(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/\s+(B\.?O|S\.?O|G\.?P\.?O|H\.?O|E\.?D\.?B\.?O|E\.?D\.?S\.?O)\.?$/i, "")
    .trim();
}

export async function lookupPincode(pin: string): Promise<PincodeInfo | null> {
  if (!/^\d{6}$/.test(pin)) return null;
  if (cache.has(pin)) return cache.get(pin) ?? null;
  const existing = inflight.get(pin);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
        cache: "force-cache",
      });
      if (!res.ok) throw new Error(`pincode api ${res.status}`);
      const data = (await res.json()) as ApiResponse;
      const entry = Array.isArray(data) ? data[0] : null;
      if (!entry || entry.Status !== "Success" || !entry.PostOffice?.length) {
        cache.set(pin, null);
        return null;
      }
      const po = entry.PostOffice[0];
      const district = (po.District ?? "").trim();
      const state = (po.State ?? "").trim();
      const cityRaw = cleanPostOfficeName(po.Name);
      const city = cityRaw || district;
      if (!city || !state) {
        cache.set(pin, null);
        return null;
      }
      const info: PincodeInfo = { city, district, state };
      cache.set(pin, info);
      return info;
    } catch {
      return null;
    } finally {
      inflight.delete(pin);
    }
  })();

  inflight.set(pin, promise);
  return promise;
}
