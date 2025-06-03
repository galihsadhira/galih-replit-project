'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Divider, Skeleton } from 'antd';
import { getDiaryContentById } from '../api/cms';
import {
    getSizeOptimizedImageUrl,
    getDiaryContentSEOAttributes,
    renderDiaryContent,
} from '../../utils/cms';
import PageHeader from '../components/PageHeader';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Head from 'next/head';
import EmbedRenderer from '../components/EmbedRenderer';

type Section = {
    sectionTitle: string | null;
    content: string[];
};
type SEO = {
    image?: any;
    description: any;
};

export default function DiaryPage() {
    const { id } = useParams();
    const [diary, setDiary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [contentDiary, setContentDiary] = useState<Section[]>([]);
    const [contentSEO, setContentSeo] = useState<SEO>();
    const router = useRouter();

    const seoTitle =
        diary?.content?.[0]?.meta?.title || 'Diary Entry';
    const seoDescription =
        contentSEO?.description || 'Read our latest diary post.';
    const seoImage = contentSEO?.image;

    useEffect(() => {
        if (!id) return;

        const fetchDiary = async () => {
            try {
                setLoading(true);
                const data = await getDiaryContentById(id);
                if (!data) {
                    setError('Diary not found');
                } else {
                    setDiary(data);
                    const rawContent =
                        data.content?.[0]?.content || '';
                    const { image, description } =
                        getDiaryContentSEOAttributes(rawContent);

                    setContentSeo({ image, description });
                    setContentDiary(renderDiaryContent(rawContent));
                    setError(null);
                }
            } catch (e) {
                setError('Failed to load diary');
            } finally {
                setLoading(false);
            }
        };

        fetchDiary();
    }, [id]);

    if (loading) return <Skeleton active paragraph={{ rows: 10 }} />;
    if (error) return <div className="p-4 text-red-600">{error}</div>;
    if (!diary) return <div className="p-4">Diary not found</div>;

    return (
        <div className="p-4">
            <Head>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <meta property="og:title" content={seoTitle} />
                <meta
                    property="og:description"
                    content={seoDescription}
                />
                {seoImage && (
                    <meta property="og:image" content={seoImage} />
                )}
                <meta property="og:type" content="article" />
                <meta
                    name="twitter:card"
                    content="summary_large_image"
                />
                <meta name="twitter:title" content={seoTitle} />
                <meta
                    name="twitter:description"
                    content={seoDescription}
                />
                {seoImage && (
                    <meta name="twitter:image" content={seoImage} />
                )}
            </Head>

            <Card className="shadow-md">
                <div className="p-4 max-w-3xl mx-auto my-4">
                    <PageHeader
                        title={diary.content?.[0]?.meta?.title}
                        description={
                            diary.content?.[0]?.meta?.description
                        }
                        extra={
                            <span className="text-sm text-gray-500">
                                {diary.content?.[0]?.meta?.date}
                            </span>
                        }
                    />

                    <div className="text-xs font-bold flex items-center gap-1 my-2">
                        <Button onClick={router.back}>
                            <ArrowLeftOutlined className="text-xs" />{' '}
                            Back to Posts
                        </Button>
                    </div>

                    <Divider />

                    <Card
                        title={
                            diary.content?.[0]?.meta?.title ||
                            'Untitled Diary'
                        }
                        cover={
                            diary.meta?.image ? (
                                <div className="w-full h-96 overflow-hidden rounded-t-md">
                                    <img
                                        src={
                                            getSizeOptimizedImageUrl(
                                                diary.meta.image,
                                                'MD'
                                            ) ?? diary.meta.image
                                        }
                                        alt={
                                            contentSEO?.description ||
                                            'Diary cover'
                                        }
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : null
                        }
                    >
                        <div className="whitespace-pre-wrap text-gray-800 space-y-6">
                            {contentDiary.length === 0 &&
                                'No content available.'}
                            {contentDiary.map((section, idx) => (
                                <div key={idx}>
                                    {section.sectionTitle && (
                                        <h2 className="text-xl font-bold mb-2">
                                            {section.sectionTitle}
                                        </h2>
                                    )}
                                    {section.content.map(
                                        (item, itemIdx) => {
                                            const getEmbedTypeAndUrl =
                                                (
                                                    str: string
                                                ):
                                                    | [string, string]
                                                    | null => {
                                                    const match =
                                                        str.match(
                                                            /<(YoutubeEmbed|TwitterEmbed|InstagramEmbed|TiktokEmbed)[^>]*url="([^"]+)"[^>]*>/
                                                        );
                                                    if (!match)
                                                        return null;
                                                    const [
                                                        ,
                                                        type,
                                                        url,
                                                    ] = match;
                                                    return [
                                                        type.replace(
                                                            'Embed',
                                                            ''
                                                        ),
                                                        url,
                                                    ];
                                                };

                                            const embed =
                                                getEmbedTypeAndUrl(
                                                    item
                                                );
                                            if (embed) {
                                                const [type, url] =
                                                    embed;
                                                return (
                                                    <EmbedRenderer
                                                        key={itemIdx}
                                                        type={
                                                            type as any
                                                        }
                                                        url={url}
                                                    />
                                                );
                                            } else if (
                                                item.startsWith('![')
                                            ) {
                                                const match =
                                                    item.match(
                                                        /!\[.*?\]\((.*?)\)/
                                                    );
                                                const imgUrl =
                                                    match?.[1];
                                                const optimizedUrl =
                                                    getSizeOptimizedImageUrl(
                                                        imgUrl,
                                                        'TH'
                                                    );
                                                return (
                                                    <div
                                                        key={itemIdx}
                                                        className="w-full overflow-hidden my-4 rounded"
                                                    >
                                                        <img
                                                            src={
                                                                optimizedUrl
                                                            }
                                                            alt="Diary content"
                                                            className="w-full h-auto object-cover rounded"
                                                            style={{
                                                                maxWidth:
                                                                    '100%',
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <p
                                                        key={itemIdx}
                                                        className="mb-2"
                                                    >
                                                        {item}
                                                    </p>
                                                );
                                            }
                                        }
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </Card>
        </div>
    );
}
