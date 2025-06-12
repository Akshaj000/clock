export type Participant = {
    id: number;
    name: string;
    avatar: string;
    isMicOn: boolean;
    isVideoOn: boolean;
    image: string;
};

export type VideoCallProps = {
    isActive?: boolean;
    onEnd?: () => void;
    participant?: Participant;
    callDuration?: number;
};

export type MediaState = {
    stream: MediaStream | null;
    audioEnabled: boolean;
    videoEnabled: boolean;
    error: string | null;
};

export type ControlButtonProps = {
    icon: React.ReactNode;
    onClick: () => void;
    active: boolean;
    danger?: boolean;
    title: string;
    className?: string;
}; 