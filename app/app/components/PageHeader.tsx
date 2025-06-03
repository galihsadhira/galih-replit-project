'use client';

import { createStyles } from 'antd-style';
import React from 'react';

const useStyle = createStyles(({ css }) => ({
    header: css`
        background: linear-gradient(135deg, #6253e1, #04befe);
        color: white;
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    `,
}));

type PageHeaderProps = {
    title: string;
    description?: string;
    extra?: React.ReactNode;
};

export default function PageHeader({
    title,
    description,
    extra,
}: PageHeaderProps) {
    const { styles } = useStyle();

    return (
        <div className={styles.header}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                    <h2 className="text-2xl font-semibold text-white">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-white/90 text-sm mt-1">
                            {description}
                        </p>
                    )}
                </div>
                {extra && <div className="text-white">{extra}</div>}
            </div>
        </div>
    );
}
