import { InjectionToken } from "@angular/core";

export interface AppConfig {
    imgPath: string;
}

export const APP_DI_CONFIG: AppConfig = {

  imgPath: 'assets/images/'

};

export let APP_CONFIG = new InjectionToken<AppConfig>('app.config');
