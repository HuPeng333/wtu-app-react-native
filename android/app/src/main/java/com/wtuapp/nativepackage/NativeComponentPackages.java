package com.wtuapp.nativepackage;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.wtuapp.layout.PullDownRefreshViewManager;
import com.wtuapp.modules.BeautifulAlertDialogManager;

import java.util.Collections;
import java.util.List;

/**
 * 注册原生模组/组件
 * @author HuPeng
 * @date 2022-03-23 15:42
 */
public class NativeComponentPackages implements ReactPackage {
    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        return Collections.singletonList(new BeautifulAlertDialogManager());
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        return Collections.singletonList(new PullDownRefreshViewManager());
    }
}