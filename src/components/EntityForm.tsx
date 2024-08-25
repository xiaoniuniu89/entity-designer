// @ts-nocheck
import { useState, useEffect } from 'react';
import { z } from 'zod';
import FieldDefinition from './FieldDefinition';
import RelationshipDefinition from './RelationshipDefinition';

// Define Zod schemas for validation
const FieldSchema = z.object({
    name: z.string().min(1, "Field name is required"),
    type: z.enum(["string", "number", "boolean", "date"]),
});

const RelationshipSchema = z.object({
    relatedEntity: z.string().min(1, "Related entity is required"),
    type: z.enum(["one-to-one", "one-to-many", "many-to-one", "many-to-many"]),
});

const EntitySchema = z.object({
    name: z.string()
        .min(1, "Entity name is required")
        .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Entity name must start with a letter or underscore and contain only letters, numbers, and underscores."),
    fields: z.array(FieldSchema).min(1, "At least one field is required"),
    relationships: z.array(RelationshipSchema).optional(),
});

const EntityForm = ({ entity, entities, onSave, onCancel }) => {
    const [entityName, setEntityName] = useState(entity?.name || '');
    const [fields, setFields] = useState(entity?.fields || []);
    const [relationships, setRelationships] = useState(entity?.relationships || []);
    const [error, setError] = useState('');

    useEffect(() => {
        setEntityName(entity?.name || '');
        setFields(entity?.fields || []);
        setRelationships(entity?.relationships || []);
    }, [entity]);

    const validateEntityName = () => {
        try {
            z.string()
                .min(1, "Entity name is required")
                .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Entity name must start with a letter or underscore and contain only letters, numbers, and underscores.")
                .parse(entityName);
            setError('');
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.errors.map(e => e.message).join(', '));
            }
            return false;
        }
    };

    const handleEntityNameChange = (e) => {
        setEntityName(e.target.value);
        validateEntityName();
    };

    const handleAddField = (field) => {
        setFields([...fields, field]);
        setError(''); // Clear any previous validation errors
    };

    const handleUpdateField = (index, field) => {
        const updatedFields = [...fields];
        updatedFields[index] = field;
        setFields(updatedFields);
        setError(''); // Clear any previous validation errors
    };

    const handleAddRelationship = (relationship) => {
        setRelationships([...relationships, relationship]);
    };

    const handleUpdateRelationship = (index, relationship) => {
        const updatedRelationships = [...relationships];
        updatedRelationships[index] = relationship;
        setRelationships(updatedRelationships);
    };

    const handleSave = () => {
        if (validateEntityName()) {
            try {
                EntitySchema.parse({ name: entityName, fields, relationships });
                onSave({ name: entityName, fields, relationships });
            } catch (err) {
                if (err instanceof z.ZodError) {
                    setError(err.errors.map(e => e.message).join(', '));
                }
            }
        }
    };

    return (
        <div className="entity-form">
            <h3>{entity?.name ? 'Edit Entity' : 'Create New Entity'}</h3>
            <input
                type="text"
                value={entityName}
                placeholder="Entity Name"
                onChange={handleEntityNameChange}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <FieldDefinition
                fields={fields}
                onAddField={handleAddField}
                onUpdateField={handleUpdateField}
            />
            <RelationshipDefinition
                currentEntityName={entityName}
                entities={entities.filter((e) => e.name !== entityName)}
                relationships={relationships}
                onAddRelationship={handleAddRelationship}
                onUpdateRelationship={handleUpdateRelationship}
            />
            <div className='button-wrapper'>
                <button onClick={handleSave} disabled={!!error}>
                    Save Entity
                </button>
                <button className="cancel-button" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default EntityForm;
