/**
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import { TM } from "@rnoh/react-native-openharmony/generated/ts";
import Logger from './Logger';
import { JSON } from '@kit.ArkTS';


let visible: boolean = false;
const TAG = "BootSplashModule";

export class BootSplashModule extends TurboModule implements TM.RNBootSplash.Spec {
  maybeRunAnimate(layoutReady: boolean, logoReady: boolean, brandReady: boolean, animateHasBeenCalled: boolean,
    animate: () => void) {
    if (layoutReady && logoReady && brandReady && !animateHasBeenCalled) {
      animateHasBeenCalled = true;
      this.hide(false).then(() => {
        Logger.info(TAG, "hide run!");
        visible = true;
        animate();
      }).catch((error) => {
        Logger.error("Error hiding:", error)
      });
    }
  }

  getContainerStyle(backgroundColor: string): Object {
    return {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor,
      alignItems: "center",
      justifyContent: "center",
    }
  }

  getLogo(logoFinalSrc: ImageSource, logoWidth: number, logoHeight: number): ImageProps {
    return logoFinalSrc == null
      ? { source: -1 }
      : {
        fadeDuration: 0,
        resizeMode: "contain",
        source: logoFinalSrc,
        style: {
          width: logoWidth,
          height: logoHeight,
        }
      };
  }

  getBrand(brandFinalSrc: ImageSource, brandBottom: number | undefined, brandWidth: number | undefined,
    brandHeight: number | undefined): ImageProps {
    return brandFinalSrc == null
      ? { source: -1 }
      : {
        fadeDuration: 0,
        resizeMode: "contain",
        source: brandFinalSrc,
        style: {
          position: "absolute",
          bottom: brandBottom,
          width: brandWidth,
          height: brandHeight,
        }
      };
  }

  useHideAnimation(config: TM.RNBootSplash.UseHideAnimationConfig,
    animate: () => void): TM.RNBootSplash.UseHideAnimation {
    Logger.info(TAG, "config" + JSON.stringify(config))
    const skipLogo = config.logo == null;
    const skipBrand = config.manifest.brand == null || config.brand == null;
    const logoWidth = config.manifest.logo.width;
    const logoHeight = config.manifest.logo.height;
    const brandBottom = config.manifest.brand?.bottom;
    const brandWidth = config.manifest.brand?.width;
    const brandHeight = config.manifest.brand?.height;
    const stants: Stants = this.getConstants();
    const darkModeEnabled: boolean = stants != null ? stants.darkModeEnabled : false;
    const backgroundColor: string =
      darkModeEnabled && config.manifest.darkBackground != null
        ? config.manifest.darkBackground
        : config.manifest.background;
    const logoFinalSrc: ImageSource = skipLogo
      ? undefined
      : darkModeEnabled && config.darkLogo != null
        ? config.darkLogo
        : config.logo;
    const brandFinalSrc: ImageSource = skipBrand
      ? undefined
      : darkModeEnabled && config.darkBrand != null
        ? config.darkBrand
        : config.brand;
    let layoutReady = false;
    let logoReady = skipLogo;
    let brandReady = skipBrand;
    let animateHasBeenCalled = false;


    const containerStyle = this.getContainerStyle(backgroundColor)
    const container: ViewStyle = {
      style: containerStyle,
    };
    layoutReady = true;


    const logo = this.getLogo(logoFinalSrc, logoWidth, logoHeight)
    logoReady = true;
    const brand = this.getBrand(brandFinalSrc, brandBottom, brandWidth, brandHeight)

    brandReady = true;
    this.maybeRunAnimate(layoutReady, logoReady, brandReady, animateHasBeenCalled, animate)
    const re: TM.RNBootSplash.UseHideAnimation = {
      container: container,
      logo: logo,
      brand: brand,
    }
    Logger.info(TAG, "return" + JSON.stringify(re));
    return re;

  }

  getConstants(): {
    darkModeEnabled: boolean;
    logoSizeRatio?: number | undefined;
    navigationBarHeight?: number | undefined;
    statusBarHeight?: number | undefined;
  } {
    return {
      darkModeEnabled: true,
      logoSizeRatio: 1,
      navigationBarHeight: 0,
      statusBarHeight: 0,
    };
  }

  hide(fade: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  isVisible(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(visible)
    });
  }
}

type ImageSource = string | number ;
type AlignItems = "normal" | "flex-start" | "flex-end" | "start" | "end" | "center" | "stretch";
type JustifyContent = "flex-start" | "flex-end" | "center" | "space-between" | "space-around";
type Position = "absolute" | "static" | "relative" | "fixed" | "sticky";

interface Stants {
  darkModeEnabled: boolean;
  logoSizeRatio?: number;
  navigationBarHeight?: number;
  statusBarHeight?: number;
}

interface Style {
  position?: Position;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  backgroundColor?: string;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
  width?: number;
  height?: number;
}

interface ViewStyle {
  style?: Style | undefined;
};

type ResizeMode = "cover" | "contain" | "stretch" | "repeat" | "center";

interface ImageProps {
  fadeDuration?: number;
  resizeMode?: ResizeMode;
  source: string | number;
  style?: Style;
}