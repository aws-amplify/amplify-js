import { TransformerClass } from "../src/Transformer";
import { GraphQLOptions } from "../src/types";

const defaultType: any = {
    ObjectDef: {
        data:{
            __type:{
                fields:[
                    {
                        name: "StringField",
                        type: {
                            name: "String"
                        }
                    },
                    {
                        name: "IntField",
                        type: {
                            name: "Int"
                        }
                    },
                    {
                        name: "FloatField",
                        type: {
                            name: "Float"
                        }
                    },
                    {
                        name: "BooleanField",
                        type: {
                            name: "Boolean"
                        }
                    }
                ]
            }
        }
    }
};

function getDefaultTypeDef(): any {
    return JSON.parse(JSON.stringify(defaultType));
}

function getDefaultTypeObject(): any {
    return {
        StringField: "test",
        IntField: 1,
        FloatField: 1.1,
        BooleanField: true
    };
}

class APIMock {    

    constructor(private keywordResults) {

    }

    /**
     * Executes a GraphQL operation
     *
     * @param {GraphQLOptions} GraphQL Options
     * @returns {Promise<GraphQLResult> | Observable<object>}
     */
    graphql({ query, variables = {} }: GraphQLOptions) {
        return new Promise((resolve, reject) => {
            for(let i in this.keywordResults) {
                console.log(i);
                if(query.indexOf(i) >= 0) {
                    resolve(this.keywordResults[i]);
                    return;
                }
            }

            reject('No value found');
        });
    }
}

describe('Transformer test', () => {
    describe('convertFromAWSJSONFields', () => {
        test('Test no AWSJSON in type', async () => {
            let transformer = new TransformerClass(new APIMock(getDefaultTypeDef()));
            let obj = getDefaultTypeObject();

            await transformer.convertFromAWSJSONFields('ObjectDef', obj);

            expect(obj).toEqual(getDefaultTypeObject());
        });

        test('Test AWSJSON in type', async () => {
            let type = getDefaultTypeDef();
            type.ObjectDef.data.__type.fields.push({name:"field1",type:{name:"AWSJSON"}});
            let transformer = new TransformerClass(new APIMock(type));
            let obj = getDefaultTypeObject();
            obj.field1 = '{"test":1}';

            await transformer.convertFromAWSJSONFields('ObjectDef', obj);
            
            let expected = getDefaultTypeObject();
            expected.field1 = {test:1};
            expect(obj).toEqual(expected);
        });

        test('Test missing field of AWSJSON in type', async () => {
            let type = getDefaultTypeDef();
            type.ObjectDef.data.__type.fields.push({name:"field1",type:{name:"AWSJSON"}});
            let transformer = new TransformerClass(new APIMock(type));
            let obj = getDefaultTypeObject();

            await transformer.convertFromAWSJSONFields('ObjectDef', obj);
            
            var expected = getDefaultTypeObject();
            expect(obj).toEqual(expected);
        });

        test('Test nested field of AWSJSON in type', async () => {
            let type = getDefaultTypeDef();
            type.ObjectDef.data.__type.fields.push({name:"subclass",type:{name:"Subclass"}});

            type.Subclass = getDefaultTypeDef().ObjectDef;
            type.Subclass.data.__type.fields.push({name:"field1",type:{name:"AWSJSON"}});

            let transformer = new TransformerClass(new APIMock(type));
            let obj = getDefaultTypeObject();
            obj.subclass = getDefaultTypeObject();
            obj.subclass.field1 = '{"test":1}';

            await transformer.convertFromAWSJSONFields('ObjectDef', obj);
            
            var expected = getDefaultTypeObject();
            expected.subclass = getDefaultTypeObject();
            expected.subclass.field1 = {test:1};
            expect(obj).toEqual(expected);
        });

        test('Type spec not expected', async () => {
            let type = getDefaultTypeDef();
            type.ObjectDef = {};
            let transformer = new TransformerClass(new APIMock(type));
            let obj = getDefaultTypeObject();
            obj.field1 = '{"test":1 }';
            
            let expected = getDefaultTypeObject();
            expected.field1 = obj.field1;

            await transformer.convertFromAWSJSONFields('ObjectDef', obj);

            expect(obj).toEqual(expected);
        });
    });

    describe('convertToAWSJSONFields', () => {
        test('Test no AWSJSON in type', async () => {
            let transformer = new TransformerClass(new APIMock(getDefaultTypeDef()));
            let obj = getDefaultTypeObject();

            await transformer.convertToAWSJSONFields('ObjectDef', obj);

            expect(obj).toEqual(getDefaultTypeObject());
        });

        test('Test AWSJSON in type', async () => {
            let type = getDefaultTypeDef();
            type.ObjectDef.data.__type.fields.push({name:"field1",type:{name:"AWSJSON"}});
            let transformer = new TransformerClass(new APIMock(type));
            let obj = getDefaultTypeObject();
            obj.field1 = { test:1 };
            
            let expected = getDefaultTypeObject();
            expected.field1 = JSON.stringify(obj.field1);

            await transformer.convertToAWSJSONFields('ObjectDef', obj);

            expect(obj).toEqual(expected);
        });

        test('Test missing field of AWSJSON in type', async () => {
            let type = getDefaultTypeDef();
            type.ObjectDef.data.__type.fields.push({name:"field1",type:{name:"AWSJSON"}});
            let transformer = new TransformerClass(new APIMock(type));
            let obj = getDefaultTypeObject();

            await transformer.convertToAWSJSONFields('ObjectDef', obj);
            
            var expected = getDefaultTypeObject();
            expect(obj).toEqual(expected);
        });

        test('Test nested field of AWSJSON in type', async () => {
            let type = getDefaultTypeDef();
            type.ObjectDef.data.__type.fields.push({name:"subclass",type:{name:"Subclass"}});

            type.Subclass = getDefaultTypeDef().ObjectDef;
            type.Subclass.data.__type.fields.push({name:"field1",type:{name:"AWSJSON"}});

            let transformer = new TransformerClass(new APIMock(type));
            let obj = getDefaultTypeObject();
            obj.subclass = getDefaultTypeObject();
            obj.subclass.field1 = {test:1};

            var expected = getDefaultTypeObject();
            expected.subclass = getDefaultTypeObject();
            expected.subclass.field1 = JSON.stringify(obj.subclass.field1);

            await transformer.convertToAWSJSONFields('ObjectDef', obj);
            
            expect(obj).toEqual(expected);
        });

        test('Test AWSJSON in type serialized twice', async () => {
            let type = getDefaultTypeDef();
            type.ObjectDef.data.__type.fields.push({name:"field1",type:{name:"AWSJSON"}});
            let transformer = new TransformerClass(new APIMock(type));
            let obj = getDefaultTypeObject();
            obj.field1 = { test:1 };
            
            let expected = getDefaultTypeObject();
            expected.field1 = JSON.stringify(obj.field1);

            await transformer.convertToAWSJSONFields('ObjectDef', obj);
            await transformer.convertToAWSJSONFields('ObjectDef', obj);

            expect(obj).toEqual(expected);
        });

        test('Type spec not expected', async () => {
            let type = getDefaultTypeDef();
            type.ObjectDef = {};
            let transformer = new TransformerClass(new APIMock(type));
            let obj = getDefaultTypeObject();
            obj.field1 = { test:1 };
            
            let expected = getDefaultTypeObject();
            expected.field1 = obj.field1;

            await transformer.convertToAWSJSONFields('ObjectDef', obj);

            expect(obj).toEqual(expected);
        });
    });
});