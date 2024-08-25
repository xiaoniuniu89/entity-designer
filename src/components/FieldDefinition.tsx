import React, { useState } from 'react';
import { z } from 'zod';
import './FieldDefinition.css'; // Import the CSS for styling

// Define Zod schema for field validation
const FieldSchema = z.object({
    name: z.string()
        .min(1, "Field name is required")
        .refine(value => {
            const camelOrUnderscorePattern = /^[a-zA-Z][a-zA-Z0-9]*$|^[a-zA-Z]+(_[a-zA-Z0-9]+)*$/;
            return camelOrUnderscorePattern.test(value);
        }, {
            message: "Field name must be in camelCase or use underscores for multi-word names."
        }),
    type: z.enum(["string", "number", "boolean", "date"]),
    required: z.boolean(),
});

const FieldDefinition = ({ fields, onAddField, onUpdateField }) => {
    const [fieldName, setFieldName] = useState('');
    const [fieldType, setFieldType] = useState('string');
    const [isRequired, setIsRequired] = useState(false); // Default to unchecked
    const [editingIndex, setEditingIndex] = useState(null);
    const [error, setError] = useState('');

    const validateField = (name) => {
        try {
            FieldSchema.parse({ name, type: fieldType, required: isRequired });
            setError('');
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.errors.map(e => e.message).join(', '));
            }
            return false;
        }
    };

    const handleAddOrUpdateField = () => {
        if (validateField(fieldName)) {
            const newField = { name: fieldName, type: fieldType, required: isRequired };
            if (editingIndex !== null) {
                onUpdateField(editingIndex, newField);
                setEditingIndex(null);
            } else {
                onAddField(newField);
            }
            setFieldName('');
            setFieldType('string');
            setIsRequired(false); // Reset to default unchecked
            setError('');
        }
    };

    const handleEditField = (index) => {
        const field = fields[index];
        setFieldName(field.name);
        setFieldType(field.type);
        setIsRequired(field.required);
        setEditingIndex(index);
    };

    const handleFieldNameChange = (e) => {
        const newName = e.target.value;
        setFieldName(newName);
        setError(''); // Clear previous error on input change
    };

    return (
        <div className="field-definition">
            <h4>Fields</h4>
            <ul>
                {fields.map((field, index) => (
                    <li key={index}>
                        {field.name} ({field.type}) {field.required ? '(Required)' : '(Optional)'}
                        <div className='button-wrapper'>
                            <button className='edit-button' onClick={() => handleEditField(index)} style={{ marginLeft: '10px' }}>Edit</button>
                        </div>
                    </li>
                ))}
            </ul>
            <input
                type="text"
                value={fieldName}
                placeholder="Field Name"
                onChange={handleFieldNameChange}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <select value={fieldType} onChange={(e) => setFieldType(e.target.value)}>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="date">Date</option>
            </select>
            <div className="required-toggle">
                <label>Required</label>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={isRequired}
                        onChange={(e) => setIsRequired(e.target.checked)}
                    />
                    <span className="slider round"></span>
                </label>
            </div>
            <button onClick={handleAddOrUpdateField} disabled={!fieldName.trim() || !!error}>
                {editingIndex !== null ? 'Update Field' : 'Add Field'}
            </button>
        </div>
    );
};

export default FieldDefinition;
