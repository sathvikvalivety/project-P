

export type AnchorPosition = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface AnchorPickerProps {
  value: AnchorPosition;
  onChange: (value: AnchorPosition) => void;
}

const POSITIONS: AnchorPosition[] = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right'
];

export function AnchorPicker({ value, onChange }: AnchorPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-1 w-24 h-24 p-1 border rounded-md bg-white">
      {POSITIONS.map((pos) => (
        <button
          key={pos}
          type="button"
          className={`w-full h-full rounded-sm border ${
            value === pos
              ? 'bg-blue-500 border-blue-600'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}
          onClick={() => onChange(pos)}
          aria-label={`Anchor ${pos.replace('-', ' ')}`}
        />
      ))}
    </div>
  );
}
