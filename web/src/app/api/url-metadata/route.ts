import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  url: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const { url } = parsed.data;

    // For YouTube URLs, use fallback immediately due to CORS and rate limiting issues
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      console.log('YouTube URL detected, using fallback metadata');
      const fallback = getYouTubeFallback(url);
      return NextResponse.json(fallback);
    }

    // Try fetching with enhanced headers
    let response;
    let html = '';
    
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AXIO-QR-Bot/1.0; +https://axio-qr.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(5000), // Further reduced timeout for Vercel
      });

      if (!response.ok) {
        console.error(`HTTP ${response.status} for ${url}`);
        throw new Error(`HTTP ${response.status}`);
      }

      html = await response.text();
    } catch (fetchError: any) {
      console.error(`Fetch failed for ${url}:`, fetchError.message);
      // Immediately fall back for known domains
      const fallback = getFallbackMetadata(url);
      if (fallback) {
        console.log('Using fallback metadata for', url);
        return NextResponse.json(fallback);
      }
      throw fetchError;
    }
    
    // Extract metadata using regex patterns
    const metadata = {
      title: extractMetaContent(html, [
        /<meta\s+property="og:title"\s+content="([^"]*)"[^>]*>/i,
        /<meta\s+name="twitter:title"\s+content="([^"]*)"[^>]*>/i,
        /<title[^>]*>([^<]*)<\/title>/i,
      ]),
      description: extractMetaContent(html, [
        /<meta\s+property="og:description"\s+content="([^"]*)"[^>]*>/i,
        /<meta\s+name="twitter:description"\s+content="([^"]*)"[^>]*>/i,
        /<meta\s+name="description"\s+content="([^"]*)"[^>]*>/i,
      ]),
      image: extractMetaContent(html, [
        /<meta\s+property="og:image"\s+content="([^"]*)"[^>]*>/i,
        /<meta\s+name="twitter:image"\s+content="([^"]*)"[^>]*>/i,
        /<meta\s+name="twitter:image:src"\s+content="([^"]*)"[^>]*>/i,
      ]),
      favicon: extractMetaContent(html, [
        /<link\s+rel="icon"\s+href="([^"]*)"[^>]*>/i,
        /<link\s+rel="shortcut icon"\s+href="([^"]*)"[^>]*>/i,
        /<link\s+rel="apple-touch-icon"\s+href="([^"]*)"[^>]*>/i,
      ]),
    };

    // Convert relative URLs to absolute
    const baseUrl = new URL(url);
    if (metadata.image && !metadata.image.startsWith('http')) {
      metadata.image = new URL(metadata.image, baseUrl.origin).toString();
    }
    if (metadata.favicon && !metadata.favicon.startsWith('http')) {
      metadata.favicon = new URL(metadata.favicon, baseUrl.origin).toString();
    }

    // Clean up the title and description
    if (metadata.title) {
      metadata.title = metadata.title.trim().replace(/\s+/g, ' ');
    }
    if (metadata.description) {
      metadata.description = metadata.description.trim().replace(/\s+/g, ' ');
    }

    // Add fallback for YouTube URLs if we didn't get enough metadata
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      if (!metadata.title && !metadata.description) {
        const fallbackMetadata = getYouTubeFallback(url);
        metadata.title = metadata.title || fallbackMetadata.title;
        metadata.description = metadata.description || fallbackMetadata.description;
        metadata.favicon = metadata.favicon || fallbackMetadata.favicon;
        metadata.image = metadata.image || fallbackMetadata.image;
      }
    }

    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error("URL metadata fetch failed:", error.message);
    
    // Try to provide fallback metadata for common domains
    try {
      const requestJson = await req.json().catch(() => null);
      const parsed = schema.safeParse(requestJson);
      if (parsed.success) {
        const fallbackMetadata = getFallbackMetadata(parsed.data.url);
        if (fallbackMetadata) {
          return NextResponse.json(fallbackMetadata);
        }
      }
    } catch {
      // Ignore errors in fallback attempt
    }
    
    return NextResponse.json(
      { error: "Failed to fetch metadata" }, 
      { status: 500 }
    );
  }
}

function extractMetaContent(html: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function getYouTubeFallback(url: string) {
  // Try to extract video ID for more specific metadata
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  
  let title = "YouTube";
  let description = "Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.";
  let image = "https://www.youtube.com/img/desktop/yt_1200.png";
  
  if (videoId) {
    title = "YouTube";
    description = `Watch this video on YouTube. Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.`;
    // Use YouTube thumbnail API
    image = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  
  return {
    title,
    description,
    favicon: "https://www.youtube.com/favicon.ico",
    image
  };
}

function getFallbackMetadata(url: string) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return getYouTubeFallback(url);
    }
    
    if (domain.includes('github.com')) {
      return {
        title: "GitHub",
        description: "GitHub is where over 100 million developers shape the future of software, together.",
        favicon: "https://github.com/favicon.ico",
        image: "https://github.githubassets.com/images/modules/site/social-cards/github-social.png"
      };
    }
    
    if (domain.includes('twitter.com') || domain.includes('x.com')) {
      return {
        title: "X (formerly Twitter)",
        description: "From breaking news and entertainment to sports and politics, get the full story with all the live commentary.",
        favicon: "https://abs.twimg.com/favicons/twitter.3.ico",
        image: "https://abs.twimg.com/errors/logo46x38.png"
      };
    }
    
    // Generic fallback based on domain
    const siteName = domain.replace('www.', '').split('.')[0];
    return {
      title: siteName.charAt(0).toUpperCase() + siteName.slice(1),
      description: `Visit ${domain}`,
      favicon: `https://${domain}/favicon.ico`,
      image: null
    };
  } catch {
    return null;
  }
}