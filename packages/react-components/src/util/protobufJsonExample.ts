// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

const protobufJsonExample = {
  nested: {
    onChainMetaData: {
      nested: {
        Gender: {
          options: {
            Female: '{"cn": "女性", "en": "Female", "ru": "Женщина"}',
            Male: '{"cn": "男性", "en": "Male", "ru": "Мужчина"}'
          },
          values: {
            Female: 1,
            Male: 0
          }
        },
        NFTMeta: {
          fields: {
            gender: {
              id: 1,
              rule: 'required',
              type: 'Gender'
            },
            imageHash: {
              id: 2,
              rule: 'optional',
              type: 'string'
            },
            name: {
              id: 3,
              rule: 'required',
              type: 'string'
            },
            traits: {
              id: 4,
              rule: 'repeated',
              type: 'PunkTrait'
            }
          }
        },
        PunkTrait: {
          options: {
            field1: '{"cn": "亚洲眼", "en": "Asian Eyes", "ru": "Азиатский тип глаз"}',
            field2: '{"cn": "黑唇", "en": "Black Lipstick", "ru": "Чёрная помада"}',
            field3: '{"cn": "鼻环", "en": "Nose Ring", "ru": "Пирсинг в носу"}',
            field4: '{"cn": "紫唇", "en": "Purple Lipstick", "ru": "Фиолетовая помада"}',
            field5: '{"cn": "红唇", "en": "Red Lipstick", "ru": "Красная помада"}',
            field6: '{"cn": "笑脸", "en": "Smile", "ru": "Улыбка"}',
            field7: '{"cn": "太阳镜", "en": "Sunglasses", "ru": "Солнечные очки"}',
            field8: '{"cn": "露齿笑脸", "en": "Teeth Smile", "ru": "Улыбка с зубами"}',
            field9: '{"cn": "露齿笑脸1", "en": "Teeth Smile1", "ru": "Улыбка с зубами1"}',
            field91: '{"cn": "露齿笑脸2", "en": "Teeth Smile2", "ru": "Улыбка с зубами2"}',
            field92: '{"cn": "露齿笑脸3", "en": "Teeth Smile3", "ru": "Улыбка с зубами3"}'
          },
          values: {
            field1: 6,
            field2: 0,
            field3: 5,
            field4: 4,
            field5: 1,
            field6: 2,
            field7: 7,
            field8: 3,
            field9: 8,
            field91: 9,
            field92: 10
          }
        }
      }
    }
  }
};

export default protobufJsonExample;
