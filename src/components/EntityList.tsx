// @ts-nocheck

const EntityList = ({ entities, onEdit, onDelete, onCreate }) => {
    return (
        <div className="entity-list">
            <h3>Entities</h3>
            <ul>
                {entities.map((entity, index) => (
                    <li key={index}>
                        <span>{entity.name}</span>
                        <div className='button-wrapper'>
                        <button className='edit-button' onClick={() => onEdit(entity)}>Edit</button>
                        <button className="cancel-button" onClick={() => onDelete(entity.name)}>Delete</button>
                        </div>
                        
                    </li>
                ))}
            </ul>
            <button onClick={onCreate}>Add New Entity</button>
        </div>
    );
};

export default EntityList;
