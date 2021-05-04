// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Root, Type } from 'protobufjs';

export type FieldType = 'string' | 'enum';

export type FieldRuleType = 'optional' | 'required' | 'repeated';

export type AttributeItemType = {
  id: number,
  fieldType: FieldType;
  name: string;
  rule: FieldRuleType;
  values: string[];
}

type EnumElemType = { options: { [key: string]: string}, values: { [key: string]: number } };
type NFTMetaType = {
  fields: {
    [key: string]: {
      id: number;
      rule: FieldRuleType;
      type: string;
    }
  }
}

export type ProtobufAttributeType = {
  nested: {
    onChainMetaData: {
      nested: {
        [key: string]: {
          fields?: {
            [key: string]: {
              id: number;
              rule: FieldRuleType;
              type: string;
            }
          }
          options?: { [key: string]: string };
          values?: { [key: string]: number };
        }
      }
    }
  }
}

function defineMessage () {
  const protobufJson = fillProtobufJson(JSON.parse('[{"fieldType":"enum","id":1,"name":"gender","rule":"required","values":["Female","Male"]},{"fieldType":"string","id":2,"name":"imageHash","rule":"optional","values":[]},{"fieldType":"string","id":3,"name":"name","rule":"required","values":[]},{"fieldType":"enum","id":4,"name":"traits","rule":"repeated","values":["Asian Eyes","Black Lipstick","Nose Ring","Purple Lipstick","Red Lipstick","Smile","Sunglasses","Teeth Smile","Teeth Smile","Teeth Smile","Teeth Smile"]}]'));

  return Root.fromJSON(protobufJson);
}

function serializeNft (payload: { [key: string]: number | number[] | string }) {
  const root = defineMessage();
  const NFTMeta = root.lookupType('onChainMetaData.NFTMeta');

  // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
  const errMsg = NFTMeta.verify(payload);

  if (errMsg) {
    throw Error(errMsg);
  }

  // Create a new message
  const message = NFTMeta.create(payload);

  // Encode a message to an Uint8Array (browser) or Buffer (node)
  return NFTMeta.encode(message).finish();
}

function convertEnumToString (value: string, key: string, NFTMeta: Type, locale: string) {
  let result = value;

  console.log('Serialized value', value, 'key', key, 'NFTMeta', NFTMeta, 'NFTMeta?.fields[key]?.resolvedType?', NFTMeta?.fields[key]?.resolvedType);

  try {
    const options = NFTMeta?.fields[key]?.resolvedType?.options as {[key: string]: string};
    const valueJsonComment = options[value];
    const translationObject = JSON.parse(valueJsonComment) as {[key: string]: string};

    if (translationObject && (translationObject[locale])) {
      result = translationObject[locale];
    }
  } catch (e) {
    console.log('Error parsing schema when trying to convert enum to string: ', e);
  }

  return result;
}

function deserializeNft (buffer: Uint8Array, locale: string) {
  const root = defineMessage();

  // Obtain the message type
  const NFTMeta = root.lookupType('onChainMetaData.NFTMeta');

  // Decode a Uint8Array (browser) or Buffer (node) to a message
  const message = NFTMeta.decode(buffer);

  // Maybe convert the message back to a plain object
  const objectItem = NFTMeta.toObject(message, {
    arrays: true, // populates empty arrays (repeated fields) even if defaults=false
    bytes: String, // bytes as base64 encoded strings
    defaults: true, // includes default values
    enums: String, // enums as string names
    longs: String, // longs as strings (requires long.js)
    objects: true, // populates empty objects (map fields) even if defaults=false
    oneofs: true
  });

  for (const key in objectItem) {
    if (NFTMeta?.fields[key]?.resolvedType?.constructor.name === 'Enum') {
      if (Array.isArray(objectItem[key])) {
        const item = objectItem[key] as string[];

        item.forEach((value: any) => {
          objectItem[key] = convertEnumToString(value, key, NFTMeta, locale);
        });
      } else {
        objectItem[key] = convertEnumToString(objectItem[key], key, NFTMeta, locale);
      }
    }
  }

  return objectItem;
}

export function initProtobuf () {
  // Exemplary payload
  const payload = {
    gender: 1, // Gender.Female,
    imageHash: 'hash',
    name: 'TokenName',
    traits: [4, 5, 6, 7] // [PunkTrait.PURPLE_LIPSTICK, PunkTrait.NOSE_RING, PunkTrait.ASIAN_EYES, PunkTrait.SUNGLASSES]
  };

  const buffer = serializeNft(payload);

  console.log('Serialized buffer: ', buffer);

  let deserializedObject = deserializeNft(buffer, 'ru');

  console.log('deserializedObject RUSSIAN: ', deserializedObject);

  deserializedObject = deserializeNft(buffer, 'en');
  console.log('deserializedObject ENGLISH: ', deserializedObject);
}

export const fillAttributes = (protobufJson: ProtobufAttributeType): AttributeItemType[] => {
  const attrs: AttributeItemType[] = [];

  try {
    const protobufStruct: ProtobufAttributeType = protobufJson;
    const fields: {
      [key: string]: {
        id: number;
        rule: FieldRuleType;
        type: string;
      }
    } = protobufStruct?.nested?.onChainMetaData?.nested?.NFTMeta?.fields || {};

    if (fields) {
      Object.keys(fields).forEach((fieldKey: string) => {
        const options: { [key: string]: string } = protobufStruct?.nested?.onChainMetaData?.nested[fields[fieldKey].type]?.options || {};
        const valuesJson = fields[fieldKey].type === 'string' ? [] : Object.values(options);
        const values: string[] = [];

        // for now we only use 'en' translation value
        valuesJson.forEach((valueJson) => {
          const parsed = JSON.parse(valueJson) as { en: string };

          values.push(parsed.en);
        });

        attrs.push({
          fieldType: fields[fieldKey].type === 'string' ? 'string' : 'enum',
          id: fields[fieldKey].id,
          name: fieldKey,
          rule: fields[fieldKey].rule,
          values: values
        });
      });
    }
  } catch (e) {
    console.log('fillAttributes error', e);
  }

  return attrs;
};

export const fillProtobufJson = (attrs: AttributeItemType[]): ProtobufAttributeType => {
  const protobufJson: ProtobufAttributeType = {
    nested: {
      onChainMetaData: {
        nested: {
          NFTMeta: {
            fields: {}
          }
        }
      }
    }
  };

  try {
    if (attrs && attrs.length) {
      attrs.forEach((attr: AttributeItemType, ind: number) => {
        if (attr.fieldType === 'enum') {
          protobufJson.nested.onChainMetaData.nested[attr.name] = {
            options: {},
            values: {}
          };
          attr.values.forEach((value: string, index: number) => {
            (protobufJson.nested.onChainMetaData.nested[attr.name] as EnumElemType).values[`field${index + 1}`] = index;
            (protobufJson.nested.onChainMetaData.nested[attr.name] as EnumElemType).options[`field${index + 1}`] = `{"en":"${value}"}`;
          });
        }

        (protobufJson.nested.onChainMetaData.nested.NFTMeta as NFTMetaType).fields[attr.name] = {
          id: ind + 1,
          rule: attr.rule,
          type: attr.fieldType === 'string' ? 'string' : attr.name
        };
      });
    }

    console.log('protobufJson', protobufJson);
  } catch (e) {
    console.log('fillProtobufJson error', e);
  }

  return protobufJson;
};

export const convertProtobufAttrToJson = (scaleAttrStr: string): ProtobufAttributeType[] => {
  /*
  try {
    const jsonObj: ScaleJsonType = JSON.parse(scaleAttrStr) as ScaleJsonType;

    return Object.keys(jsonObj.root).map((key: string) => {
      const resArray = /^Vec<(.*)>$/.exec(jsonObj.root[key]);
      const isBytes = jsonObj.root[key] === 'Bytes';

      return {
        count: resArray !== null ? 'array' : 'single',
        name: resArray !== null ? resArray[1] : key,
        pluralName: resArray !== null ? key : '',
        type: isBytes ? 'Bytes' : '_enum',
        values: resArray !== null ? Object.keys(jsonObj[resArray[1]]._enum) : isBytes ? [] : Object.keys(jsonObj[key]._enum)
      };
    });
  } catch (e) {
    console.log('convertScaleAttrToJson error', e);
  }
   */

  return [];
};

export const convertProtobufAttrFromJson = (jsonStr: ProtobufAttributeType[]): string => {
  /* let parentObj: AttributeItemType = {};
  const rootObj: {[key: string]: string} = {};

  try {
    jsonStr.forEach((jsonStrItem: AttributeType) => {
      if (jsonStrItem.type === 'Bytes') {
        rootObj[jsonStrItem.name] = 'Bytes';
      } else if (jsonStrItem.type === '_enum') {
        const objValues = jsonStrItem.values.map((value: string) => [value, null]);

        parentObj[jsonStrItem.name] = {
          _enum: Object.fromEntries(objValues) as {[key: string]: null}
        };

        if (jsonStrItem.count === 'single') {
          rootObj[jsonStrItem.name] = jsonStrItem.name;
        } else if (jsonStrItem.count === 'array') {
          rootObj[jsonStrItem.pluralName] = `Vec<${jsonStrItem.name}>`;
        }
      }
    });

    parentObj = {
      ...parentObj,
      root: rootObj
    };

    return JSON.stringify(parentObj);
  } catch (e) {
    console.log('convertScaleAttrFromJson error', e);
  }
   */
  return '';
};
