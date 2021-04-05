import _ from 'lodash';
import React, {useRef, useState} from 'react';
import {StyleSheet, StyleProp, ViewStyle, LayoutChangeEvent} from 'react-native';
import Reanimated, {EasingNode, Easing as _Easing} from 'react-native-reanimated';
import {Colors, BorderRadiuses, Spacings} from '../../style';
import {asBaseComponent} from '../../commons/new';
import View from '../view';
import Segment, {SegmentItemProps} from './segment';

const {interpolate: _interpolate, interpolateNode} = Reanimated;
const interpolate = interpolateNode || _interpolate;
const Easing = EasingNode || _Easing;
const BORDER_WIDTH = 1;

export type SegmentedControlProps = {
  /**
   * Array on segments.
   */
  segments?: SegmentItemProps[];
  /**
   * The color of the active segment (label and outline).
   */
  activeColor?: string;
  /**
   * The color of the inactive segments (label).
   */
  inActiveColor?: string;
  /**
   * Callback for when index has change.
   */
  onChangeIndex?: (index: number) => void;
  /**
   * Initial index to be active.
   */
  initialIndex?: number;
  /**
   * The segmentedControl borderRadius
   */
  borderRadius?: number;
  /**
   * The background color of the inactive segments
   */
  backgroundColor?: string;
  /**
   * The background color of the active segment
   */
  activeBackgroundColor?: string;
  /**
   * The color of the segmentedControl outline
   */
  outlineColor?: string;
  /**
   * The width of the segments
   */
  outlineWidth?: number;
  /**
   * Should the icon be on right of the label
   */
  iconOnRight?: boolean;
  /**
   * Additional spacing styles for the container
   */
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * @description: SegmentedControl component for toggling two values or more
 * @example: https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/componentScreens/SegmentedControlScreen.tsx
 */
const SegmentedControl = (props: SegmentedControlProps) => {
  const {
    onChangeIndex,
    initialIndex = 0,
    containerStyle,
    segments,
    activeColor = Colors.primary,
    borderRadius = BorderRadiuses.br100,
    backgroundColor = Colors.grey80,
    activeBackgroundColor = Colors.white,
    inActiveColor = Colors.grey20,
    outlineColor = Colors.grey60,
    outlineWidth = BORDER_WIDTH
  } = props;
  const [selectedSegment, setSelectedSegment] = useState(-1);

  const segmentsStyle = useRef([] as {x: number; width: number}[]);
  const segmentsCounter = useRef(0);
  const animatedValue = useRef(new Reanimated.Value(initialIndex));

  const onSegmentPress = (index: number) => {
    if (selectedSegment !== index) {
      onChangeIndex?.(index);
      updateSelectedSegment(index);
    }
  };

  const updateSelectedSegment = (index: number) => {
    Reanimated.timing(animatedValue.current, {
      toValue: index,
      duration: 300,
      easing: Easing.bezier(0.33, 1, 0.68, 1)
    }).start();

    return setSelectedSegment(index);
  };

  const onLayout = (index: number, event: LayoutChangeEvent) => {
    const {x, width} = event.nativeEvent.layout;
    segmentsStyle.current[index] = {x, width};
    segmentsCounter.current++;

    return segmentsCounter.current === segments?.length && setSelectedSegment(initialIndex);
  };

  const getAnimatedStyle = () => {
    if (segmentsCounter.current === segments?.length) {
      const left = interpolate(animatedValue.current, {
        inputRange: _.times(segmentsCounter.current),
        outputRange: _.map(segmentsStyle.current, segment => segment.x - outlineWidth)
      });

      const width = interpolate(animatedValue.current, {
        inputRange: _.times(segmentsCounter.current),
        outputRange: _.map(segmentsStyle.current, segment => segment.width)
      });

      return {width, left};
    }
    return undefined;
  };

  const animatedStyle = getAnimatedStyle();

  return (
    <View
      row
      center
      style={[
        styles.container,
        containerStyle,
        {borderRadius, backgroundColor, borderColor: outlineColor, borderWidth: outlineWidth}
      ]}
    >
      <Reanimated.View
        style={[
          styles.selectedSegment,
          animatedStyle,
          {borderColor: activeColor, borderRadius, backgroundColor: activeBackgroundColor, borderWidth: outlineWidth}
        ]}
      />
      {_.map(segments, (_value, index) => {
        return (
          <Segment
            key={index}
            segmentOnLayout={onLayout}
            index={index}
            onPress={onSegmentPress}
            isSelected={selectedSegment === index}
            activeColor={activeColor}
            inActiveColor={inActiveColor}
            {...segments?.[index]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.grey80,
    height: Spacings.s7,
    borderColor: Colors.grey60
  },
  selectedSegment: {
    height: Spacings.s7 - 2 * BORDER_WIDTH,
    position: 'absolute',
    backgroundColor: Colors.white
  },
  segment: {
    paddingHorizontal: Spacings.s3
  }
});

SegmentedControl.displayName = 'SegmentedControl';

export default asBaseComponent<SegmentedControlProps>(SegmentedControl);
