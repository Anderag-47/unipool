const { useState, useEffect } = React;

const POPULAR_AREAS = [
  'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 3', 'DHA Phase 4', 'DHA Phase 5',
  'Gulberg', 'Model Town', 'Johar Town', 'Cantt', 'Faisal Town',
  'Garden Town', 'Wapda Town', 'Valencia', 'Bahria Town', 'Askari',
  'FCC',
];

function LocationPicker({ value, onChange, label, defaultOption }) {
  const [inputType, setInputType] = useState('dropdown');
  const [textInput, setTextInput] = useState('');
  const [dropdownValue, setDropdownValue] = useState('');

  // Sync with parent state
  useEffect(() => {
    if (value) {
      if (POPULAR_AREAS.includes(value)) {
        setDropdownValue(value);
        setTextInput('');
        setInputType('dropdown');
      } else {
        setTextInput(value);
        setDropdownValue('');
        setInputType('text');
      }
    } else {
      setDropdownValue(defaultOption || '');
      setTextInput('');
      setInputType('dropdown');
    }
  }, [value, defaultOption]);

  const handleDropdownChange = (e) => {
    const newValue = e.target.value;
    setDropdownValue(newValue);
    setTextInput('');
    setInputType('dropdown');
    onChange(newValue);
  };

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    setTextInput(newValue);
    setDropdownValue('');
    setInputType('text');
    onChange(newValue);
  };

  return (
    <div className="location-picker">
      <label className="block text-gray-700 mb-2">{label}</label>
      <select
        value={dropdownValue}
        onChange={handleDropdownChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 mb-2"
      >
        <option value="">Select a location</option>
        {POPULAR_AREAS.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </select>
      <div className="text-center text-gray-500 my-2">OR</div>
      <input
        type="text"
        value={textInput}
        onChange={handleTextChange}
        placeholder="Enter custom location"
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
    </div>
  );
}

window.LocationPicker = LocationPicker;