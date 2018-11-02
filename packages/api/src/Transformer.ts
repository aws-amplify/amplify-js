/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { APIInterface } from './API';

/**
 * The AWS Amplify transformer.  This object handles serialization and deserialization
 * of objects using the AWSJSON property type through the use of querying type definitions
 * then using them to serialize and deserialize the appropriate fields, even if they're nested
 */
export class TransformerClass {
  private typedefs : any = {};
  private api: APIInterface;

  constructor(apiClass: APIInterface) {
      if(apiClass) {
          this.api = apiClass;
      }
  }

  /** 
   * Deserializes AWSJSON fields by leveraging the graphql type definition 
   * @param graphqlType The name of the type specified in the graphql
   * @param object The object which needs its AWSJSON fields deserialized.  This must be the representation of the 
   * type specified
   * @example
   * let result = await <any> amplifyService.api.graphql(query);
   * Transformer.convertFromAWSJSONFields('Car', result);
   * */
  public async convertFromAWSJSONFields<T>(graphqlType: string, object: T) : Promise<T> {
    const typedef = await this.retrieveTypeDefinition(graphqlType);
    this.applyDeserializeTypeDef(typedef, object);
    return object;
  }

  /** 
   * Serializes all fields of type AWSJSON specified in the graphql type definition 
   * @param graphqlType The name of the type specified in the graphql
   * @param object The object which needs its AWSJSON fields serialized.  This must be the representation of the type 
   * specified
   * @example 
   * Transformer.convertFromAWSJSONFields('Car', car);
   * <any>await API.graphql(graphqlOperation(updateCar, { input: await this.convertToAWSJSONFields('Car', car) }));
   * */
  public async convertToAWSJSONFields<T>(graphqlType: string, object: T) : Promise<T> {
    const typedef = await this.retrieveTypeDefinition(graphqlType);
    this.applySerializeTypeDef(typedef, object);
    return object;
  }

    /**
     * Applies a typedef transform which was generated from the graphql type definitions to deserialize AWSJSON fields
     * @param typedef The transform definition
     * @param object The object to transform
     */
    private applyDeserializeTypeDef<T>(typedef: any, object: T) { 
        // Walk through the abstract fields for the type
        for(const i in typedef) {
            const typeName: string = typedef[i];
            if(typeName === 'AWSJSON') {
                // We're dealing with a AWSJSON field, check to see if we can deserialize it, and if so deserialize
                if(object[i] && typeof object[i] === 'string') {
                    object[i] = JSON.parse(object[i]);
                }
            } else {
                // In this case we're dealing with a defined class, rather than a value type
                // use recursion to check child fields for AWSJSON fields to deserialize
                this.applyDeserializeTypeDef(typedef[i], object[i]);
            }
        }

        console.log(JSON.stringify(object));
    }

    /**
     * Applies a typedef transform which was generated from the graphql type definitions to serialize AWSJSON fields
     * @param typedef The transform definition
     * @param object The object to transform
     */
    private applySerializeTypeDef<T>(typedef: any, object: T) {
        // Walk through fields for the type which are abstract fields      
        for(const i in typedef) {
            // Check to see if the object has the field
            if(object[i]) {
                // Check if we're dealing with a class or an AWSJSON type
                const typeName: string = typedef[i];
                if(typeName === 'AWSJSON') {
                    if(typeof object[i] !== 'string') {
                        object[i] = JSON.stringify(object[i]);
                    }
                } else {
                    // Use recursion to handle child properties
                    this.applySerializeTypeDef(typedef[i], object[i]);
                }
            }
        }
    }

    /**
     * Retrieves a transform object from graphql representing how to interpret
     * an object in order to handle AWSJSON deserialization
     * @param graphqlType The type to retrieve from graphql
     */
    private async retrieveTypeDefinition(graphqlType: string) : Promise<any> {
        // Check to see if we have the definition already
        if(this.typedefs[graphqlType]) {
            return this.typedefs[graphqlType];
        }
        
        const typedef: any = {};

        // Retrieve the graphql type from the server
        const graphQlDef: any = await this.api.graphql({ query: `
            query GetType${graphqlType} {
                __type(name: "${graphqlType}") {
                    name
                    fields {
                        name
                        type {
                            name
                        }
                    }
                }
            }`});

        // Make sure we get back the data we expect
        if(!graphQlDef || !graphQlDef.data || !graphQlDef.data['__type'] || !graphQlDef.data['__type'].fields) {
            this.typedefs[graphqlType] = {};
            return this.typedefs[graphqlType];
        }

        // Extract fields which are AWSJSON.  If there are fields which are not the basic types retrieve the type 
        // definition from the server
        // The output will only contain fields which must be acted on
        const fields = graphQlDef.data['__type'].fields;
        for(const i in fields) {
            // Check the field to see if its an AWSJSON or a type which is outside the primitive types defined in 
            // graphql
            const field = fields[i];
            const typeName: string = field.type.name;
            if(typeName === 'AWSJSON') {
                typedef[field.name] = 'AWSJSON';
            } else if (typeName !== 'String' && typeName !== 'Int' && typeName !== 'Float' 
                        && typeName !== 'Boolean' && typeName !== '' && typeName !== 'ID') {
                // Retrieve the definition for the type which is not a primitive type
                typedef[field.name] = await this.retrieveTypeDefinition(field.type.name);
            }
        }

        // cache the type definition
        this.typedefs[graphqlType] = typedef;
        return typedef;
    }
}
