'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, Skeleton } from 'antd';
import { getDiaryContentById } from '../api/cms';

type Section = {
    sectionTitle: string | null;
    content: string[];
};

export default function DiaryPage() {
    const { id } = useParams();
    const [diary, setDiary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [contentDiary, setContentDiary] = useState<Section[]>([]);

    const splitDiaryContentIntoSections = (
        raw: string
    ): Section[] => {
        const lines = raw
            ?.split('\n')
            ?.map((line) => line.trim())
            ?.filter(Boolean);
        const sections: Section[] = [];
        let currentSection: Section = {
            sectionTitle: null,
            content: [],
        };

        const isSectionTitle = (line: string) =>
            line.startsWith('### ');
        const isTiktokEmbed = (line: string) =>
            line.startsWith('<TiktokEmbed') && line.endsWith('/>');
        const isImageMarkdown = (line: string) =>
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
            } else if (isTiktokEmbed(line) || isImageMarkdown(line)) {
                currentSection.content.push(line);
            } else {
                const processed = line.replace(
                    /\*\*(.*?)\*\*/g,
                    '$1'
                );
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
    };

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
                    const result =
                        splitDiaryContentIntoSections(rawContent);
                    setContentDiary(result);

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

    if (loading) {
        return <Skeleton active paragraph={{ rows: 10 }} />;
    }

    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    if (!diary) {
        return <div className="p-4">Diary not found</div>;
    } else {
        console.log(diary.content[0].meta.title);
    }

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <Card
                title={
                    diary.content[0].meta.title || 'Untitled Diary'
                }
                cover={
                    diary.meta?.image ? (
                        <img
                            src={diary.meta.image}
                            alt="Diary cover"
                            className="w-full max-h-96 object-cover rounded-t-md"
                        />
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
                            {section.content.map((item, itemIdx) => {
                                if (item.startsWith('<TiktokEmbed')) {
                                    const match =
                                        item.match(/url="([^"]+)"/);
                                    const tiktokUrl = match?.[1];
                                    return (
                                        <div
                                            key={itemIdx}
                                            className="my-4"
                                        >
                                            <iframe
                                                src={tiktokUrl}
                                                width="100%"
                                                height="500"
                                                allow="autoplay; fullscreen"
                                                title="TikTok"
                                            ></iframe>
                                        </div>
                                    );
                                } else if (item.startsWith('![')) {
                                    const match =
                                        item.match(
                                            /!\[.*?\]\((.*?)\)/
                                        );
                                    const imgUrl = match?.[1];
                                    return (
                                        <img
                                            key={itemIdx}
                                            src={imgUrl}
                                            alt="Diary content"
                                            className="my-4 w-full rounded"
                                        />
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
                            })}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
