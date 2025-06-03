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
            return `${base}_${desiredSize.toLowerCase()}.${ext}`;
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

    const imageMatch = contentData.match(
        /!\[.*?\]\((https:\/\/.*?)\)/
    );
    const text = contentData
        .replace(/<[^>]+>/g, '')
        .replace(/!\[]\((.*?)\)/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/#+\s?(.*)/g, '')
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
export function renderDiaryContent(rawContent) {
    if (!rawContent) return [];

    const lines = rawContent
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    const sections = [];
    let currentSection = {
        sectionTitle: null,
        content: [],
    };

    const isSectionTitle = (line) => line.startsWith('### ');
    const isSubSectionTitle = (line) => line.startsWith('## ');
    const isEmbed = (line) =>
        (line.startsWith('<YoutubeEmbed') && line.endsWith('/>')) ||
        (line.startsWith('<InstagramEmbed') && line.endsWith('/>')) ||
        (line.startsWith('<TiktokEmbed') && line.endsWith('/>')) ||
        (line.startsWith('<TwitterEmbed') && line.endsWith('/>'));
    const isImageMarkdown = (line) =>
        line.startsWith('![') &&
        line.includes('](') &&
        line.endsWith(')');

    for (const line of lines) {
        if (isSectionTitle(line)) {
            if (currentSection.content.length) {
                sections.push(currentSection);
            }
            currentSection = {
                sectionTitle: line.replace(/^###\s*/, '').trim(),
                content: [],
            };
        } else if (isSubSectionTitle(line)) {
            if (currentSection.content.length) {
                sections.push(currentSection);
            }
            currentSection = {
                sectionTitle: line.replace(/^##\s*/, '').trim(),
                content: [],
            };
        } else if (isEmbed(line) || isImageMarkdown(line)) {
            currentSection.content.push(line);
        } else {
            const processed = line.replace(/\*\*(.*?)\*\*/g, '$1');
            const splitParentheses = processed
                .split(/(\(.*?\))/g)
                .filter(Boolean);
            currentSection.content.push(
                ...splitParentheses.map((s) => s.trim())
            );
        }
    }

    if (currentSection.content.length) {
        sections.push(currentSection);
    }

    return sections;
}
