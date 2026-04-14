import type { OGData } from '../types';

function getMetaContent(html: string, property: string): string | null {
  // Try property="og:X"
  const re1 = new RegExp(
    `<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  // Try content="..." property="og:X" (reversed attribute order)
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`,
    'i'
  );
  const m = html.match(re1) ?? html.match(re2);
  return m ? decodeHtmlEntities(m[1]) : null;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function parsePrice(text: string): number | undefined {
  const match = text.match(/\$?([\d,]+)/);
  if (!match) return undefined;
  const val = parseInt(match[1].replace(/,/g, ''), 10);
  return isNaN(val) ? undefined : val;
}

function parseBeds(text: string): number | undefined {
  const match = text.match(/(\d+)\s*(?:bed|bd|br)/i);
  if (!match) return undefined;
  const val = parseInt(match[1], 10);
  return isNaN(val) ? undefined : val;
}

function parseBaths(text: string): number | undefined {
  const match = text.match(/(\d+\.?\d*)\s*(?:bath|ba)/i);
  if (!match) return undefined;
  const val = parseFloat(match[1]);
  return isNaN(val) ? undefined : val;
}

function parseSqft(text: string): number | undefined {
  const match = text.match(/([\d,]+)\s*(?:sq\.?\s*ft|sqft)/i);
  if (!match) return undefined;
  const val = parseInt(match[1].replace(/,/g, ''), 10);
  return isNaN(val) ? undefined : val;
}

export async function parseListingUrl(url: string): Promise<OGData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        Accept: 'text/html',
      },
    });
    const html = await response.text();

    const title = getMetaContent(html, 'title') ?? '';
    const description = getMetaContent(html, 'description') ?? '';
    const imageUrl = getMetaContent(html, 'image') ?? undefined;

    const combined = `${title} ${description}`;

    // Try to extract address from title
    // Zillow: "123 Main St, City, ST 12345 | Zillow"
    // Redfin: "123 Main St, City, ST 12345 - 3 Beds, 2 Baths"
    let address: string | undefined;
    const addressMatch = title.match(/^([^|–—]+(?:St|Ave|Dr|Blvd|Ln|Way|Rd|Ct|Pl|Cir|Pkwy)[^|–—]*)/i);
    if (addressMatch) {
      address = addressMatch[1].trim().replace(/\s+/g, ' ');
    } else {
      // Fallback: use first portion of title before pipe/dash
      const fallback = title.split(/[|–—]/)[0].trim();
      if (fallback.length > 5) address = fallback;
    }

    const price = parsePrice(combined);
    const bedrooms = parseBeds(combined);
    const bathrooms = parseBaths(combined);
    const sqft = parseSqft(combined);

    return { address, price, imageUrl, description, bedrooms, bathrooms, sqft };
  } catch (err) {
    console.warn('[OG Parser] fetch failed:', err);
    return {};
  }
}
