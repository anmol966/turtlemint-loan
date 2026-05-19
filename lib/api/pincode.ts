export type PincodeInfo = {
  tehsil: string | null;
  district: string;
  state: string;
};

type PostOffice = {
  Block?: string;
  District?: string;
  State?: string;
};
type ApiResponse = Array<{ Status?: string; PostOffice?: PostOffice[] | null }>;

const cache = new Map<string, PincodeInfo | null>();
const inflight = new Map<string, Promise<PincodeInfo | null>>();

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
      const blockRaw = (po.Block ?? "").trim();
      const tehsil = blockRaw && blockRaw.toUpperCase() !== "NA" ? blockRaw : null;
      if (!district || !state) {
        cache.set(pin, null);
        return null;
      }
      const info: PincodeInfo = { tehsil, district, state };
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
