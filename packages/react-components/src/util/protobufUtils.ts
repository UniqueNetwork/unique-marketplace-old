// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Root, Type } from 'protobufjs';

export type FieldType = 'string' | 'enum';

export type FieldRuleType = 'optional' | 'required' | 'repeated';

export type AttributeItemType = {
  id?: number,
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

function defineMessage (protobufJson: ProtobufAttributeType) {
  // const protobufJson = fillProtobufJson(JSON.parse('[{"fieldType":"enum","id":1,"name":"gender","rule":"required","values":["Female","Male"]},{"fieldType":"string","id":2,"name":"imageHash","rule":"optional","values":[]},{"fieldType":"string","id":3,"name":"name","rule":"required","values":[]},{"fieldType":"enum","id":4,"name":"traits","rule":"repeated","values":["Asian Eyes","Black Lipstick","Nose Ring","Purple Lipstick","Red Lipstick","Smile","Sunglasses","Teeth Smile","Teeth Smile","Teeth Smile","Teeth Smile"]}]'));

  return Root.fromJSON(protobufJson);
}

export function serializeNft (onChainSchema: ProtobufAttributeType, payload: { [key: string]: number | number[] | string }): Uint8Array {
  try {
    const root = defineMessage(onChainSchema);
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
  } catch (e) {
    console.log('serializeNft error', e);
  }

  return new Uint8Array();
}

export function convertEnumToString (value: string, key: string, NFTMeta: Type, locale: string) {
  let result = value;

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

export function deserializeNft (onChainSchema: ProtobufAttributeType, buffer: Uint8Array, locale: string): { [key: string]: any } {
  try {
    const root = defineMessage(onChainSchema);
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
    const newObjectItem = { ...objectItem };

    for (const key in objectItem) {
      if (NFTMeta?.fields[key]?.resolvedType?.options && Object.keys(NFTMeta?.fields[key]?.resolvedType?.options as {[key: string]: string}).length > 0) {
        if (Array.isArray(objectItem[key])) {
          const item = objectItem[key] as string[];

          item.forEach((value: string, index) => {
            (newObjectItem[key] as string[])[index] = convertEnumToString(value, key, NFTMeta, locale);
          });
        } else {
          newObjectItem[key] = convertEnumToString(objectItem[key], key, NFTMeta, locale);
        }
      }
    }

    return newObjectItem;
  } catch (e) {
    console.log('deserializeNft error', e);
  }

  return {};
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
  } catch (e) {
    console.log('fillProtobufJson error', e);
  }

  return protobufJson;
};
