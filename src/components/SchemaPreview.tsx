import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const SchemaPreview = ({ entities }) => {
    const generateJsonSchema = () => {
        const entitySchemas = entities.map(entity => {
            const fieldSchemas = entity.fields.reduce((acc, field) => {
                let fieldSchema;
                switch (field.type) {
                    case 'string':
                        fieldSchema = z.string();
                        break;
                    case 'number':
                        fieldSchema = z.number();
                        break;
                    case 'boolean':
                        fieldSchema = z.boolean();
                        break;
                    case 'date':
                        fieldSchema = z.string().refine(value => !isNaN(Date.parse(value)), {
                            message: "Invalid date format"
                        });
                        break;
                    default:
                        fieldSchema = z.any();
                }
                // Handle required fields
                acc[field.name] = field.required ? fieldSchema : fieldSchema.optional();
                return acc;
            }, {});

            const schema = z.object(fieldSchemas).strict();
            return { name: entity.name, jsonSchema: zodToJsonSchema(schema, entity.name) };
        });

        return entitySchemas;
    };

    const jsonSchemas = generateJsonSchema();

    return (
        <div className="schema-preview">
            <h3>Schema Preview</h3>
            <pre style={{ 
                whiteSpace: 'pre-wrap', 
                wordWrap: 'break-word', 
                backgroundColor: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '5px', 
                maxHeight: '400px', 
                overflowY: 'auto',
                fontSize: '14px', 
                lineHeight: '1.5' 
            }}>
                {JSON.stringify(jsonSchemas, null, 2)}
            </pre>
            <button className='export-button' onClick={() => exportSchema(jsonSchemas)}>Export Schema</button>
        </div>
    );
    
};

const exportSchema = (jsonSchemas) => {
    let schemaName = prompt('Enter a name for your schema:');
    if (schemaName) {
        schemaName = schemaName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

        if (schemaName) {
            const schema = JSON.stringify(jsonSchemas, null, 2);
            const blob = new Blob([schema], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${schemaName}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('Invalid schema name. Please try again.');
        }
    }
};

export default SchemaPreview;
