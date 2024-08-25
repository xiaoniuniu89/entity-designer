// @ts-nocheck
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
                    case 'relation':
                        fieldSchema = z.number().int().positive(); // Assuming a positive integer for foreign keys
                        break;
                    default:
                        fieldSchema = z.any();
                }
                // Handle required fields
                acc[field.name] = field.required ? fieldSchema : fieldSchema.optional();
                return acc;
            }, {});

            // Automatically add an id field if it's not defined
            if (!fieldSchemas.hasOwnProperty('id')) {
                fieldSchemas.id = z.number().int().positive().optional();
            }

            // Create the Zod schema and convert it to JSON schema
            const schema = z.object(fieldSchemas).strict();
            const jsonSchema = zodToJsonSchema(schema, entity.name);

            // Ensure properties and definitions exist in the schema
            if (!jsonSchema.properties) {
                jsonSchema.properties = {};
            }
            if (!jsonSchema.definitions) {
                jsonSchema.definitions = {};
            }

            // Handle relationships
            entity.relationships?.forEach(relationship => {
                const relatedEntityName = relationship.relatedEntity;
                
                // Ensure the related entity definition exists
                if (!jsonSchema.definitions[relatedEntityName]) {
                    jsonSchema.definitions[relatedEntityName] = {
                        type: "object",
                        properties: {
                            id: { type: "integer" }
                        }
                    };
                }

                // Add the relationship field
                jsonSchema.properties[`${relatedEntityName}_id`] = {
                    $ref: `#/definitions/${relatedEntityName}`,
                    description: `Reference to the ${relatedEntityName}`
                };

                // Add to required fields if necessary
                if (relationship.required) {
                    jsonSchema.required = jsonSchema.required || [];
                    jsonSchema.required.push(`${relatedEntityName}_id`);
                }
            });

            return { name: entity.name, jsonSchema };
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
