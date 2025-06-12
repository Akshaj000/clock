import React from 'react';

const SuccessPage: React.FC = () => {
    return (
        <div className="min-h-screen relative overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url("/skiing.png")',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)'
                }}
            />
            <div className="relative min-h-screen flex items-center justify-center">
                <div className="bg-black/50 p-8 rounded-lg">
                    <h1 className="text-white text-3xl font-bold">
                        You have unlocked part of your friend&apos;s memory!
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default SuccessPage; 