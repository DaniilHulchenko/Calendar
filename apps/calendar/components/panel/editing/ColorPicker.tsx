import { SketchPicker } from "react-color";

const ColorPicker = ({
  color,
  onChange,
}: {
  color: string;
  onChange: (hex: string) => void;
}) => (
  <SketchPicker
    color={color}
    disableAlpha
    onChange={(color) => onChange(color.hex)}
  />
);

export default ColorPicker;
