// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

const protobufJsonExample = {
  nested: {
    onchainmetadata: {
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
              rule: 'required',
              type: 'string'
            },
            name: {
              id: 3,
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
            ASIAN_EYES: '{"cn": "亚洲眼", "en": "Asian Eyes", "ru": "Азиатский тип глаз"}',
            BLACK_LIPSTICK: '{"cn": "黑唇", "en": "Black Lipstick", "ru": "Чёрная помада"}',
            NOSE_RING: '{"cn": "鼻环", "en": "Nose Ring", "ru": "Пирсинг в носу"}',
            PURPLE_LIPSTICK: '{"cn": "紫唇", "en": "Purple Lipstick", "ru": "Фиолетовая помада"}',
            RED_LIPSTICK: '{"cn": "红唇", "en": "Red Lipstick", "ru": "Красная помада"}',
            SMILE: '{"cn": "笑脸", "en": "Smile", "ru": "Улыбка"}',
            SUNGLASSES: '{"cn": "太阳镜", "en": "Sunglasses", "ru": "Солнечные очки"}',
            TEETH_SMILE: '{"cn": "露齿笑脸", "en": "Teeth Smile", "ru": "Улыбка с зубами"}'
          },
          values: {
            ASIAN_EYES: 6,
            BLACK_LIPSTICK: 0,
            NOSE_RING: 5,
            PURPLE_LIPSTICK: 4,
            RED_LIPSTICK: 1,
            SMILE: 2,
            SUNGLASSES: 7,
            TEETH_SMILE: 3
          }
        }
      }
    }
  }
};

export default protobufJsonExample;
