import { NextResponse } from "next/server";

type LangText = { languageCode?: string; description?: string };

type PrhV3Company = {
  businessId?: { value?: string; registrationDate?: string };
  names?: Array<{ name?: string; type?: string; endDate?: string }>;
  mainBusinessLine?: { descriptions?: LangText[] };
  companyForms?: Array<{ type?: string; descriptions?: LangText[]; endDate?: string }>;
  addresses?: Array<{
    type?: number;
    city?: string;
    postCode?: string;
    street?: string;
    endDate?: string;
    postOffices?: Array<{ city?: string; languageCode?: string }>;
  }>;
  registrationDate?: string;
};

type PrhV3Response = {
  totalResults?: number;
  companies?: PrhV3Company[];
};

function normalize(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 7)}-${digits.slice(7)}`;
  return raw.trim();
}

function pickFi(texts: LangText[] | undefined): string {
  if (!texts?.length) return "";
  const fi = texts.find((t) => t.languageCode === "1");
  return (fi ?? texts[0])?.description ?? "";
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ ytunnus: string }> },
) {
  const { ytunnus: raw } = await ctx.params;
  const ytunnus = normalize(decodeURIComponent(raw));

  if (!/^\d{7}-\d$/.test(ytunnus)) {
    return NextResponse.json(
      { error: "Virheellinen Y-tunnus. Käytä muotoa 1234567-8." },
      { status: 400 },
    );
  }

  // PRH bis/v1 on poistunut; käytössä YTJ avoin data v3.
  const url = `https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId=${encodeURIComponent(ytunnus)}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `PRH-haku epäonnistui (${res.status}).` },
        { status: 502 },
      );
    }

    const data = (await res.json()) as PrhV3Response;
    const company = data.companies?.[0];
    if (!company || (data.totalResults ?? 0) < 1) {
      return NextResponse.json(
        { error: "Yritystä ei löytynyt PRH:n avoimesta datasta." },
        { status: 404 },
      );
    }

    const activeName =
      company.names?.find((n) => n.type === "1" && !n.endDate) ??
      company.names?.find((n) => !n.endDate) ??
      company.names?.[0];

    const form =
      company.companyForms?.find((f) => !f.endDate) ?? company.companyForms?.[0];
    const formLabel = pickFi(form?.descriptions);
    const onOsakeyhtio = /osakeyhtiö/i.test(formLabel);

    const address =
      company.addresses?.find((a) => !a.endDate && a.type === 1) ??
      company.addresses?.find((a) => !a.endDate) ??
      company.addresses?.[0];

    const postOffice =
      address?.postOffices?.find((p) => p.languageCode === "1") ??
      address?.postOffices?.[0];
    const kotipaikka =
      postOffice?.city ??
      address?.city ??
      "";

    return NextResponse.json({
      yTunnus: company.businessId?.value ?? ytunnus,
      nimi: activeName?.name ?? "",
      kotipaikka,
      toimiala: pickFi(company.mainBusinessLine?.descriptions),
      perustamispaiva:
        company.registrationDate ?? company.businessId?.registrationDate ?? "",
      companyForm: formLabel,
      onOsakeyhtio,
    });
  } catch {
    return NextResponse.json(
      { error: "Yhteys PRH-palveluun epäonnistui." },
      { status: 502 },
    );
  }
}
