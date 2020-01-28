import { OnInit, OnDestroy } from '@angular/core';
import { AmplifyService } from '../../../providers';
export declare class SumerianSceneComponentCore implements OnInit, OnDestroy {
    protected amplifyService: AmplifyService;
    sceneName: string;
    loading: boolean;
    loadPercentage: number;
    muted: boolean;
    showEnableAudio: boolean;
    isVRCapable: boolean;
    isVRPresentationActive: boolean;
    isFullscreen: boolean;
    sceneError: any;
    amplifyUI: any;
    protected logger: any;
    data: any;
    constructor(amplifyService: AmplifyService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    progressCallback: (progress: any) => void;
    loadAndStartScene(): Promise<void>;
    setMuted(muted: any): void;
    toggleVRPresentation(): void;
    onFullscreenChange(): void;
    maximize(): Promise<void>;
    minimize(): Promise<void>;
}
