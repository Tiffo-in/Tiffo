import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';

import { ColorScheme } from '../theme/colors';
import { useTheme } from '../theme/useTheme';

const { width: SW } = Dimensions.get('window');

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface AlertOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'confirm' | 'info';
  buttons?: AlertButton[];
}

interface AlertContextType {
  alert: (options: AlertOptions) => void;
  success: (title: string, message: string, onOk?: () => void) => void;
  error: (title: string, message: string, onOk?: () => void) => void;
  warning: (title: string, message: string, onOk?: () => void) => void;
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
  ) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const C = useTheme();
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);

  const anim = useRef(new Animated.Value(0)).current;

  // Animation values for scale and bounce of buttons
  const scaleAnims = useRef<Record<string, Animated.Value>>({}).current;

  const show = (opts: AlertOptions) => {
    setOptions(opts);
    setVisible(true);
  };

  useEffect(() => {
    if (visible) {
      // Scale and backdrop fade-in spring animation
      Animated.spring(anim, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      anim.setValue(0);
    }
  }, [visible]);

  const dismiss = (callback?: () => void) => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setOptions(null);
      if (callback) {
        callback();
      }
    });
  };

  const handleButtonPress = (btn: AlertButton) => {
    dismiss(btn.onPress);
  };

  // Helper APIs
  const success = (title: string, message: string, onOk?: () => void) => {
    show({
      title,
      message,
      type: 'success',
      buttons: [{ text: 'OK', onPress: onOk, style: 'default' }],
    });
  };

  const error = (title: string, message: string, onOk?: () => void) => {
    show({
      title,
      message,
      type: 'error',
      buttons: [{ text: 'OK', onPress: onOk, style: 'destructive' }],
    });
  };

  const warning = (title: string, message: string, onOk?: () => void) => {
    show({
      title,
      message,
      type: 'warning',
      buttons: [{ text: 'OK', onPress: onOk, style: 'default' }],
    });
  };

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
  ) => {
    show({
      title,
      message,
      type: 'confirm',
      buttons: [
        { text: cancelText, onPress: onCancel, style: 'cancel' },
        { text: confirmText, onPress: onConfirm, style: 'default' },
      ],
    });
  };

  const getIconConfig = (type?: string) => {
    switch (type) {
      case 'success':
        return {
          name: 'checkmark-circle' as const,
          color: C.success,
          bgColor: C.successBg,
        };
      case 'error':
        return {
          name: 'close-circle' as const,
          color: C.error,
          bgColor: C.errorBg,
        };
      case 'warning':
        return {
          name: 'warning' as const,
          color: C.warning,
          bgColor: C.warningBg,
        };
      case 'confirm':
        return {
          name: 'help-circle' as const,
          color: C.secondary,
          bgColor: C.secondaryMuted,
        };
      default:
        return {
          name: 'information-circle' as const,
          color: C.primary,
          bgColor: C.primaryMuted,
        };
    }
  };

  const iconConfig = getIconConfig(options?.type);

  // Animation values for rendering dialog scaling and opacity
  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const modalScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  const modalTranslateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 0],
  });

  const S = styles(C);

  const getBtnScale = (key: string) => {
    if (!scaleAnims[key]) {
      scaleAnims[key] = new Animated.Value(1);
    }
    return scaleAnims[key];
  };

  const onPressInBtn = (key: string) => {
    Animated.spring(getBtnScale(key), {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const onPressOutBtn = (key: string) => {
    Animated.spring(getBtnScale(key), {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  return (
    <AlertContext.Provider value={{ alert: show, success, error, warning, confirm }}>
      {children}

      <Modal transparent visible={visible} animationType="none" onRequestClose={() => dismiss()}>
        <View style={S.overlay}>
          {/* Animated Backdrop */}
          <TouchableWithoutFeedback
            onPress={() => {
              if (options?.type !== 'confirm') {
                dismiss();
              }
            }}
          >
            <Animated.View style={[S.backdrop, { opacity: backdropOpacity }]} />
          </TouchableWithoutFeedback>

          {/* Alert Content Box */}
          <Animated.View
            style={[
              S.modalContainer,
              {
                opacity: anim,
                transform: [{ scale: modalScale }, { translateY: modalTranslateY }],
              },
            ]}
          >
            {/* Header Icon */}
            <View style={[S.iconContainer, { backgroundColor: iconConfig.bgColor }]}>
              <Ionicons name={iconConfig.name} size={38} color={iconConfig.color} />
            </View>

            {/* Texts */}
            <View style={S.content}>
              <Text style={S.title}>{options?.title}</Text>
              <Text style={S.message}>{options?.message}</Text>
            </View>

            {/* Buttons Row */}
            <View
              style={[
                S.buttonContainer,
                options?.buttons && options.buttons.length > 2 && { flexDirection: 'column' },
              ]}
            >
              {options?.buttons?.map((btn, idx) => {
                const isCancel = btn.style === 'cancel';
                const isDestructive = btn.style === 'destructive';
                const btnKey = `${btn.text}_${idx}`;
                const btnScale = getBtnScale(btnKey);

                // Styling button based on its role
                let btnStyle: any = S.btnPrimary;
                let textStyle = S.btnTextPrimary;

                if (isCancel) {
                  btnStyle = S.btnCancel;
                  textStyle = S.btnTextCancel;
                } else if (isDestructive) {
                  btnStyle = S.btnDestructive;
                  textStyle = S.btnTextPrimary;
                } else if (options?.type === 'warning') {
                  btnStyle = S.btnWarning;
                  textStyle = S.btnTextPrimary;
                } else if (options?.type === 'confirm') {
                  btnStyle = S.btnConfirm;
                  textStyle = S.btnTextPrimary;
                } else if (options?.type === 'success') {
                  btnStyle = S.btnSuccess;
                  textStyle = S.btnTextPrimary;
                }

                return (
                  <Animated.View
                    key={btnKey}
                    style={{
                      flex: (options?.buttons?.length || 0) <= 2 ? 1 : 0,
                      width: '100%',
                      transform: [{ scale: btnScale }],
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={1}
                      onPressIn={() => onPressInBtn(btnKey)}
                      onPressOut={() => onPressOutBtn(btnKey)}
                      style={[
                        S.button,
                        btnStyle,
                        (options?.buttons?.length || 0) > 2 && { marginBottom: 8 },
                      ]}
                      onPress={() => handleButtonPress(btn)}
                    >
                      <Text style={[S.btnText, textStyle]}>{btn.text}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return ctx;
};

const styles = (C: ColorScheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000000',
    },
    modalContainer: {
      width: Math.min(SW * 0.85, 340),
      backgroundColor: C.surfaceCard,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: Platform.OS === 'android' ? 0 : 1,
      borderColor: C.borderLight,
    },
    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    content: {
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: C.textPrimary,
      textAlign: 'center',
      marginBottom: 10,
    },
    message: {
      fontSize: 14,
      fontWeight: '500',
      color: C.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      width: '100%',
    },
    button: {
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      width: '100%',
    },
    btnText: {
      fontSize: 15,
      fontWeight: '700',
    },
    btnPrimary: {
      backgroundColor: C.primary,
      shadowColor: C.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    btnSuccess: {
      backgroundColor: C.success,
      shadowColor: C.success,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    btnWarning: {
      backgroundColor: C.warning,
      shadowColor: C.warning,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    btnConfirm: {
      backgroundColor: C.secondary,
      shadowColor: C.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    btnDestructive: {
      backgroundColor: C.error,
      shadowColor: C.error,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    btnCancel: {
      backgroundColor: C.surface,
      borderWidth: 1.5,
      borderColor: C.border,
    },
    btnTextPrimary: {
      color: '#FFFFFF',
    },
    btnTextCancel: {
      color: C.textSecondary,
    },
  });
