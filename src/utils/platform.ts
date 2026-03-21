export const isFirefox: boolean = import.meta.env.FIREFOX;
export const isChrome: boolean = import.meta.env.CHROME;

export const isFireFoxPrivateMode =
    isFirefox && browser.extension.inIncognitoContext;
