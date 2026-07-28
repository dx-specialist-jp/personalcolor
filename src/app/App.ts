import { NoFaceDetectedError, runDiagnosis } from '../core/imagePipeline';
import { renderErrorScreen } from '../screens/ErrorScreen';
import { renderGuidanceScreen } from '../screens/GuidanceScreen';
import { renderHomeScreen } from '../screens/HomeScreen';
import { renderProcessingScreen } from '../screens/ProcessingScreen';
import { renderResultScreen } from '../screens/ResultScreen';
import { renderUploadScreen } from '../screens/UploadScreen';
import type { DiagnosisResult } from '../types';

type ScreenName = 'home' | 'guidance' | 'upload' | 'processing' | 'result' | 'error';

/** 画面(screens/*)から参照する、Appが提供する操作の抽象。screens側はAppの内部状態を直接触らない。 */
export interface AppActions {
  goHome: () => void;
  goGuidance: () => void;
  goUpload: () => void;
  processFile: (file: File) => Promise<void>;
  reset: () => void;
}

export class App implements AppActions {
  private readonly root: HTMLElement;
  private screen: ScreenName = 'home';
  private result: DiagnosisResult | null = null;
  private errorMessage = '';
  private isFirstRender = true;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  start(): void {
    this.render();
  }

  goHome = (): void => {
    this.navigate('home');
  };

  goGuidance = (): void => {
    this.navigate('guidance');
  };

  goUpload = (): void => {
    this.navigate('upload');
  };

  processFile = async (file: File): Promise<void> => {
    this.navigate('processing');
    try {
      const result = await runDiagnosis(file);
      this.replaceResult(result);
      this.navigate('result');
    } catch (error) {
      this.errorMessage =
        error instanceof NoFaceDetectedError
          ? error.message
          : '画像の解析中にエラーが発生しました。別の写真で再度お試しください。';
      this.navigate('error');
    }
  };

  reset = (): void => {
    this.replaceResult(null);
    this.navigate('upload');
  };

  private replaceResult(next: DiagnosisResult | null): void {
    // 直前の診断のプレビュー画像(Object URL)を確実に解放し、端末上に参照が残らないようにする
    if (this.result) URL.revokeObjectURL(this.result.previewObjectUrl);
    this.result = next;
  }

  private navigate(screen: ScreenName): void {
    this.screen = screen;
    this.render();
  }

  private render(): void {
    this.root.replaceChildren();

    switch (this.screen) {
      case 'home':
        this.root.append(renderHomeScreen(this));
        break;
      case 'guidance':
        this.root.append(renderGuidanceScreen(this));
        break;
      case 'upload':
        this.root.append(renderUploadScreen(this));
        break;
      case 'processing':
        this.root.append(renderProcessingScreen());
        break;
      case 'result':
        if (!this.result) {
          this.navigate('upload');
          return;
        }
        this.root.append(renderResultScreen(this, this.result));
        break;
      case 'error':
        this.root.append(renderErrorScreen(this, this.errorMessage));
        break;
    }

    // 画面遷移時にメインコンテンツへフォーカスを移し、スクリーンリーダーへ画面切替を伝える。
    // 初回読み込み時は自然なページロードのフォーカスに任せるため対象外にする。
    if (this.isFirstRender) {
      this.isFirstRender = false;
    } else {
      this.root.querySelector('main')?.focus({ preventScroll: false });
    }
  }
}
