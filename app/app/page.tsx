'use client';

import { useEffect, useState, useCallback } from 'react';
import { getDiaryFeed } from '../app/api/cms';
import { Card, Row, Col } from 'antd';
import Link from 'next/link';
import { getSizeOptimizedImageUrl } from '../utils/cms';
import PageHeader from './components/PageHeader';
export default function HomePage() {
    const [diaries, setDiaries] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    const PAGE_SIZE = 10;

    const loadMoreData = useCallback(async () => {
        if (loading) return;
        setLoading(true);

        try {
            const data = await getDiaryFeed();
            const allItems = data?.content || [];
            const start = page * PAGE_SIZE;
            const end = start + PAGE_SIZE;
            const nextItems = allItems.slice(start, end);
            setDiaries((prev) => [...prev, ...nextItems]);
            setPage((prev) => prev + 1);
        } finally {
            setLoading(false);
        }
    }, [loading, page]);

    useEffect(() => {
        loadMoreData();
    }, []);

    return (
        <div className="p-4">
            <Card className={`shadow-md`}>
                <PageHeader
                    title="Diary Feed"
                    description="Browse recent diary entries"
                />

                <div
                    className="overflow-auto max-h-[300px] p-2"
                    style={{
                        scrollbarGutter: 'stable',
                        WebkitOverflowScrolling: 'touch',
                    }}
                >
                    <Row gutter={[24, 24]} justify="start">
                        {diaries.map((item) => {
                            return (
                                <Col
                                    key={
                                        item.id ||
                                        item.meta.id ||
                                        item.meta.image
                                    }
                                    xs={24}
                                    sm={24}
                                    md={16}
                                    lg={12}
                                >
                                    <Link href={`/${item.id}`}>
                                        <Card
                                            hoverable
                                            cover={
                                                item.meta.image ? (
                                                    <img
                                                        src={getSizeOptimizedImageUrl(
                                                            item.meta
                                                                .image
                                                        )}
                                                        alt="Diary"
                                                        className="h-48 w-full object-cover rounded-t-md"
                                                    />
                                                ) : (
                                                    <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                                                        No Image
                                                    </div>
                                                )
                                            }
                                            className="h-full cursor-pointer"
                                            style={{
                                                padding: '1rem',
                                            }}
                                            title={item.meta.title}
                                        >
                                            <div className="font-bold text-base mb-2"></div>
                                            <div className="text-sm text-gray-700">
                                                {
                                                    item.meta
                                                        .description
                                                }
                                            </div>
                                        </Card>
                                    </Link>
                                </Col>
                            );
                        })}
                    </Row>
                </div>
            </Card>
        </div>
    );
}
