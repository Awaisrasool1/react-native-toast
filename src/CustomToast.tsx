import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  View,
  PanResponder,
  TouchableOpacity,
  Platform,
} from 'react-native';

interface ToastComponentProps extends ToastProps {
  onHide: () => void;
}
export type ToastType = 'success' | 'error' | 'warning';
export type ToastPosition = 'top' | 'bottom';

export interface ToastProps {
  message: string;
  type: ToastType;
  position: ToastPosition;
  duration: number;
  onHide?: () => void;
}
const SWIPE_THRESHOLD = 50;
const DEFAULT_DURATION = 3000;
const MIN_DURATION = 1000;
const MAX_DURATION = 10000;
const postion = Platform.OS == 'ios' ? 60 : 20;

const Toast: React.FC<ToastComponentProps> = ({
  message,
  type,
  position,
  duration: propDuration,
  onHide,
}) => {
  const duration = propDuration
    ? Math.min(Math.max(propDuration, MIN_DURATION), MAX_DURATION)
    : DEFAULT_DURATION;

  const slideAnim = useRef(
    new Animated.Value(position === 'top' ? -100 : 100),
  ).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const remainingTimeRef = useRef<number>(duration);
  const startTimeRef = useRef<number>(0);

  const startProgressAnimation = (startFromValue: number = 0) => {
    progressAnim.setValue(startFromValue);
    startTimeRef.current = Date.now();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: remainingTimeRef.current,
      useNativeDriver: false,
    }).start();
  };

  const pauseProgress = () => {
    progressAnim.stopAnimation();
    const elapsedTime = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(
      0,
      remainingTimeRef.current - elapsedTime,
    );
  };

  const resetProgress = () => {
    progressAnim.stopAnimation();
    remainingTimeRef.current = duration;
    startTimeRef.current = 0;
  };

  const startDismissTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(dismissToast, remainingTimeRef.current);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pauseProgress();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        Animated.spring(scaleAnim, {
          toValue: 0.97,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        const newY = gestureState.dy;
        const isUpSwipe = newY < 0;
        const isDownSwipe = newY > 0;

        if (
          (position === 'top' && isUpSwipe) ||
          (position === 'bottom' && isDownSwipe)
        ) {
          translateYAnim.setValue(newY);
          const newOpacity = Math.max(0, 1 - Math.abs(newY) / 200);
          opacityAnim.setValue(newOpacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const isUpSwipe = gestureState.dy < 0;
        const isDownSwipe = gestureState.dy > 0;
        const shouldDismiss =
          (position === 'top' &&
            isUpSwipe &&
            Math.abs(gestureState.dy) > SWIPE_THRESHOLD) ||
          (position === 'bottom' &&
            isDownSwipe &&
            Math.abs(gestureState.dy) > SWIPE_THRESHOLD);

        if (shouldDismiss) {
          Animated.parallel([
            Animated.timing(translateYAnim, {
              toValue: position === 'top' ? -500 : 500,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => onHide());
        } else {
          Animated.parallel([
            Animated.spring(translateYAnim, {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }),
            Animated.spring(opacityAnim, {
              toValue: 1,
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }),
          ]).start(() => {
            startProgressAnimation();
            startDismissTimer();
          });
        }
      },
    }),
  ).current;

  useEffect(() => {
    resetProgress();
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      startProgressAnimation();
      startDismissTimer();
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) onHide();
    });
  };

  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          indicatorColor: '#4CAF50',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          title: `Success`,
        };
      case 'error':
        return {
          indicatorColor: '#F44336',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          title: `Error`,
        };
      case 'warning':
        return {
          indicatorColor: '#FF9800',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          title: `Warning`,
        };
      default:
        return {
          indicatorColor: '#333333',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          title: `Info`,
        };
    }
  };

  const config = getToastConfig(type);

  const progressHeight = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '0%'],
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.toast,
        {
          opacity: opacityAnim,
          transform: [
            {translateY: slideAnim},
            {translateY: translateYAnim},
            {scale: scaleAnim},
          ],
          backgroundColor: config.backgroundColor,
        },
        position === 'top' ? styles.top : styles.bottom,
      ]}>
      <View style={styles.indicatorContainer}>
        <View
          style={[styles.indicator, {backgroundColor: config.indicatorColor}]}
        />
        <Animated.View
          style={[
            styles.progressIndicator,
            {
              backgroundColor: config.indicatorColor,
              height: progressHeight,
            },
          ]}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, {color: config.indicatorColor}]}>
          {config.title}
        </Text>
        <Text style={[styles.message, {color: config.textColor}]}>
          {message}
        </Text>
      </View>
      <TouchableOpacity onPress={dismissToast} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    borderRadius: 8,
    marginHorizontal: 16,
    position: 'absolute',
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 3,
      height: 3, 
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84, 
    elevation: 3, 
    minHeight: 64,
    // overflow: 'hidden',
    backgroundColor: '#fff', 
  },
  indicatorContainer: {
    width: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  progressIndicator: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 16,
    color: '#0000',
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  closeButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragIndicator: {
    width: 30,
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 1.5,
    marginTop: 4,
  },
  top: {
    top: postion,
  },
  bottom: {
    bottom: 30,
  },
  closeButtonText: {
    color: '#000',
    fontSize: 24,
  },
});

export default Toast;
