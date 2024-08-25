import React, { useState } from 'react';
import EntityList from './components/EntityList';
import EntityForm from './components/EntityForm';
import SchemaPreview from './components/SchemaPreview';

function App() {
    const [entities, setEntities] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleCreateEntity = () => {
        setSelectedEntity({ name: '', fields: [], relationships: [] });
        setIsEditing(true);
    };

    const handleEditEntity = (entity) => {
        setSelectedEntity(entity);
        setIsEditing(true);
    };

    const handleSaveEntity = (entity) => {
        if (selectedEntity && selectedEntity.name) {
            setEntities(entities.map((e) => (e.name === selectedEntity.name ? entity : e)));
        } else {
            setEntities([...entities, entity]);
        }
        setSelectedEntity(null);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setSelectedEntity(null);
        setIsEditing(false);
    };

    const handleDeleteEntity = (entityName) => {
        setEntities(entities.filter((e) => e.name !== entityName));
    };

    return (
        <div className="app">
            <h1>Entity Designer</h1>
            {!isEditing ? (
                <>
                    <EntityList
                        entities={entities}
                        onEdit={handleEditEntity}
                        onDelete={handleDeleteEntity}
                        onCreate={handleCreateEntity}
                    />
                    <SchemaPreview entities={entities} />
                </>
            ) : (
                <EntityForm
                    entity={selectedEntity}
                    entities={entities}
                    onSave={handleSaveEntity}
                    onCancel={handleCancelEdit}
                />
            )}
        </div>
    );
}

export default App;
