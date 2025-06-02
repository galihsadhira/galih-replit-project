const CDN_WISATA_URL = 'https://cdn.wisata.app';
const CDN_TWITTER_URL = 'https://pbs.twimg.com';
const CDN_WISATA_IMG_SIZE = {
    TH: 'th',
    XS: 'xs',
    SM: 'sm',
    MD: 'md',
    LG: 'lg',
};

/**
 * TASK: Find available image size for Twitter CDN
 */
const CDN_TWITTER_IMG_SIZE = {
    THUMB: 'thumb',
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
};

/**
 * TASK: Replace original image URL with size-optimized image URL.
 * @example
 * For Wisata CDN URL:
 * ```
 * https://cdn.wisata.app/diary/87511695-cafc-401b-8eba-2db648083556.jpg
 * - https://cdn.wisata.app/diary/87511695-cafc-401b-8eba-2db648083556_th.jpg
 * - https://cdn.wisata.app/diary/87511695-cafc-401b-8eba-2db648083556_lg.jpg
 * ```
 *
 * Note that some images may not have optimized URL variants.
 */
export function getSizeOptimizedImageUrl(originalUrl, desiredSize) {
    try {
        const url = new URL(originalUrl);

        if (url.hostname.includes('cdn.wisata.app')) {
            const extMatch = url.pathname.match(/\.(\w+)$/);
            if (!extMatch) return originalUrl;
            const ext = extMatch[1];
            const base = originalUrl.replace(`.${ext}`, '');
            return `${base}_${desiredSize}.${ext}`;
        }

        if (url.hostname.includes('pbs.twimg.com')) {
            url.searchParams.set('name', desiredSize);
            return url.toString();
        }

        return originalUrl;
    } catch (e) {
        return originalUrl;
    }
}

/**
 * TASK: Extracts SEO attributes from diary content
 */
export function getDiaryContentSEOAttributes(contentData) {
    if (!contentData || typeof contentData !== 'string') return {};

    const imageMatch = contentData.match(/!\[]\((.*?)\)/);
    const text = contentData
        .replace(/<[^>]+>/g, '') // strip tags
        .replace(/!\[]\((.*?)\)/g, '') // remove images
        .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold marks
        .replace(/#+\s?(.*)/g, '') // remove headers
        .trim();

    const description = text.split(/\n|\./)[0]?.trim();

    return {
        image: imageMatch?.[1] || null,
        description: description || null,
    };
}

/**
 * TASK: Convert diary content to renderable data
 *
 * The content coming from `/cms/diary` is in MDX (Markdown with Embedded Components) format. This function help render that content.
 *
 * Known MDX components are:
 * - \<YoutubeEmbed />
 * - \<InstagramEmbed />
 * - \<TiktokEmbed />
 * - \<TwitterEmbed />
 */
export function renderDiaryContent(contentData) {
    if (!contentData || typeof contentData !== 'string') return [];

    const lines = contentData
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
    const blocks = [];

    for (const line of lines) {
        if (line.startsWith('### ')) {
            blocks.push({
                type: 'heading',
                text: line.replace(/^###\s*/, ''),
            });
        } else if (/^!\[]\((.*?)\)/.test(line)) {
            const url = line.match(/^!\[]\((.*?)\)/)?.[1];
            blocks.push({ type: 'image', url });
        } else if (line.startsWith('<TiktokEmbed')) {
            const urlMatch = line.match(/url=\"(.*?)\"/);
            blocks.push({
                type: 'embed',
                platform: 'tiktok',
                url: urlMatch?.[1],
            });
        } else if (line.startsWith('<YoutubeEmbed')) {
            const urlMatch = line.match(/url=\"(.*?)\"/);
            blocks.push({
                type: 'embed',
                platform: 'youtube',
                url: urlMatch?.[1],
            });
        } else if (line.startsWith('<InstagramEmbed')) {
            const urlMatch = line.match(/url=\"(.*?)\"/);
            blocks.push({
                type: 'embed',
                platform: 'instagram',
                url: urlMatch?.[1],
            });
        } else if (line.startsWith('<TwitterEmbed')) {
            const urlMatch = line.match(/url=\"(.*?)\"/);
            blocks.push({
                type: 'embed',
                platform: 'twitter',
                url: urlMatch?.[1],
            });
        } else {
            const cleaned = line.replace(/\*\*(.*?)\*\*/g, '$1');
            blocks.push({ type: 'paragraph', text: cleaned });
        }
    }

    return blocks;
}
