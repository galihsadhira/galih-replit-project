'use client';

import { useEffect } from 'react';

export default function EmbedRenderer({
    type,
    url,
}: {
    type: 'Youtube' | 'Twitter' | 'Instagram' | 'Tiktok';
    url: string;
}) {
    useEffect(() => {
        if (type === 'Twitter') {
            const script = document.createElement('script');
            script.src = 'https://platform.twitter.com/widgets.js';
            script.async = true;
            document.body.appendChild(script);
        }

        if (type === 'Instagram') {
            const script = document.createElement('script');
            script.src = 'https://www.instagram.com/embed.js';
            script.async = true;
            script.onload = () => {
                if ((window as any).instgrm) {
                    (window as any).instgrm.Embeds.process();
                }
            };
            document.body.appendChild(script);
        }

        if (type === 'Tiktok') {
            const script = document.createElement('script');
            script.src = 'https://www.tiktok.com/embed.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, [type, url]);

    switch (type) {
        case 'Youtube':
            return (
                <div className="my-4">
                    <iframe
                        src={url}
                        width="100%"
                        height="400"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        title="YouTube Video"
                        className="w-full rounded"
                    ></iframe>
                </div>
            );

        case 'Twitter':
            return (
                <div className="my-4">
                    <blockquote className="twitter-tweet">
                        <a href={url}></a>
                    </blockquote>
                </div>
            );

        case 'Instagram':
            return (
                <div className="my-4">
                    <blockquote
                        className="instagram-media"
                        data-instgrm-captioned
                        data-instgrm-permalink={url}
                        style={{ width: '100%', margin: '0 auto' }}
                    ></blockquote>
                </div>
            );

        case 'Tiktok':
            return (
                <div className="my-4">
                    <blockquote
                        className="tiktok-embed"
                        cite={url}
                        data-video-id=""
                        style={{ maxWidth: 605, minWidth: 325 }}
                    >
                        <section></section>
                    </blockquote>
                </div>
            );

        default:
            return null;
    }
}
