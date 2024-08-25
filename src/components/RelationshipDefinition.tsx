// @ts-nocheck
import { useState, useEffect } from 'react';

const RelationshipDefinition = ({ currentEntityName, entities, relationships, onAddRelationship, onUpdateRelationship }) => {
    const [relatedEntity, setRelatedEntity] = useState('');
    const [relationshipType, setRelationshipType] = useState('one-to-many');
    const [editingIndex, setEditingIndex] = useState(null);

    useEffect(() => {
        if (entities.length === 0) {
            setRelatedEntity('');
        }
    }, [entities]);

    const handleAddOrUpdateRelationship = () => {
        const existingRelationship = relationships.find(
            (rel, index) =>
                rel.relatedEntity === relatedEntity && (editingIndex === null || editingIndex !== index)
        );

        if (!existingRelationship && relatedEntity) {
            const newRelationship = { relatedEntity, type: relationshipType };

            if (editingIndex !== null) {
                onUpdateRelationship(editingIndex, newRelationship);
                setEditingIndex(null);
            } else {
                onAddRelationship(newRelationship);
            }

            setRelatedEntity('');
            setRelationshipType('one-to-many');
        } else {
            alert('A relationship with this entity already exists.');
        }
    };

    const handleEditRelationship = (index) => {
        const relationship = relationships[index];
        setRelatedEntity(relationship.relatedEntity);
        setRelationshipType(relationship.type);
        setEditingIndex(index);
    };

    const describeRelationship = (relationship) => {
        const type = relationship.type.trim();  // Ensure no leading/trailing spaces

        let from, to;
        if (type === 'one-to-many') {
            from = 'one';
            to = 'many';
        } else if (type === 'many-to-one') {
            from = 'many';
            to = 'one';
        } else if (type === 'many-to-many') {
            from = 'many';
            to = 'many';
        } else if (type === 'one-to-one') {
            from = 'one';
            to = 'one';
        } else {
            from = 'unknown';
            to = 'unknown';
        }

        if (from === 'one' && to === 'many') {
            return `One ${relationship.relatedEntity} can have many ${currentEntityName}(s).`;
        } else if (from === 'many' && to === 'one') {
            return `Many ${currentEntityName}(s) can belong to one ${relationship.relatedEntity}.`;
        } else if (from === 'many' && to === 'many') {
            return `Many ${currentEntityName}(s) can belong to many ${relationship.relatedEntity}(s).`;
        } else if (from === 'one' && to === 'one') {
            return `One ${currentEntityName} can be associated with one ${relationship.relatedEntity}.`;
        } else {
            return `Unrecognized relationship type between ${currentEntityName} and ${relationship.relatedEntity}.`;
        }
    };

    return (
        <div className="relationship-definition">
            <h4>Relationships</h4>
            <ul>
                {relationships.map((rel, index) => (
                    <li key={index}>
                        {describeRelationship(rel)}
                        <button onClick={() => handleEditRelationship(index)} style={{ marginLeft: '10px' }}>Edit</button>
                    </li>
                ))}
            </ul>
            <select
                value={relatedEntity}
                onChange={(e) => setRelatedEntity(e.target.value)}
            >
                <option value="" disabled>Select related entity</option>
                {entities.map((entity) => (
                    <option key={entity.name} value={entity.name}>
                        {entity.name}
                    </option>
                ))}
            </select>
            <select
                value={relationshipType}
                onChange={(e) => setRelationshipType(e.target.value)}
            >
                <option value="one-to-many">One-to-Many</option>
                <option value="many-to-one">Many-to-One</option>
                <option value="many-to-many">Many-to-Many</option>
                <option value="one-to-one">One-to-One</option> {/* Added One-to-One */}
            </select>
            <button onClick={handleAddOrUpdateRelationship} disabled={!relatedEntity}>
                {editingIndex !== null ? 'Update Relationship' : 'Add Relationship'}
            </button>
        </div>
    );
};

export default RelationshipDefinition;
