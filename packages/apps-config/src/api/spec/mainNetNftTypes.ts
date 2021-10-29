// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

const defaultNftTypes = `{
        "AccountInfo": "AccountInfoWithTripleRefCount",
        "CrossAccountId": {
                "_enum": {
                        "Substrate": "AccountId",
                        "Ethereum": "H160"
                }
        },
        "AccessMode": {
                "_enum": [
                        "Normal",
                        "WhiteList"
                ]
        },
        "CallSpec": {
                "module": "u32",
                "method": "u32"
        },
        "DecimalPoints": "u8",
        "CollectionMode": {
                "_enum": {
                        "NFT": null,
                        "Fungible": "DecimalPoints",
                        "ReFungible": null
                }
        },
        "Ownership": {
                "owner": "CrossAccountId",
                "fraction": "u128"
        },
        "FungibleItemType": {
                "value": "u128"
        },
        "NftItemType": {
                "owner": "CrossAccountId",
                "constData": "Vec<u8>",
                "variableData": "Vec<u8>"
        },
        "ReFungibleItemType": {
                "owner": "Vec<Ownership<CrossAccountId>>",
                "constData": "Vec<u8>",
                "variableData": "Vec<u8>"
        },
        "SponsorshipState": {
                "_enum": {
                        "Disabled": null,
                        "Unconfirmed": "AccountId",
                        "Confirmed": "AccountId"
                }
        },
        "Collection": {
                "owner": "AccountId",
                "mode": "CollectionMode",
                "access": "AccessMode",
                "decimalPoints": "DecimalPoints",
                "name": "Vec<u16>",
                "description": "Vec<u16>",
                "tokenPrefix": "Vec<u8>",
                "mintMode": "bool",
                "offchainSchema": "Vec<u8>",
                "schemaVersion": "SchemaVersion",
                "sponsorship": "SponsorshipState",
                "limits": "CollectionLimits",
                "variableOnChainSchema": "Vec<u8>",
                "constOnChainSchema": "Vec<u8>",
                "metaUpdatePermission": "MetaUpdatePermission",
                "transfersEnabled": "bool"
        },
        "RawData": "Vec<u8>",
        "Address": "MultiAddress",
        "LookupSource": "MultiAddress",
        "Weight": "u64",
        "CreateNftData": {
                "constData": "Vec<u8>",
                "variableData": "Vec<u8>"
        },
        "CreateFungibleData": {
                "value": "u128"
        },
        "CreateReFungibleData": {
                "constData": "Vec<u8>",
                "variableData": "Vec<u8>",
                "pieces": "u128"
        },
        "CreateItemData": {
                "_enum": {
                        "NFT": "CreateNftData",
                        "Fungible": "CreateFungibleData",
                        "ReFungible": "CreateReFungibleData"
                }
        },
        "SchemaVersion": {
                "_enum": [
                        "ImageURL",
                        "Unique"
                ]
        },
        "MetaUpdatePermission": {
                "_enum": [
                        "ItemOwner",
                        "Admin",
                        "None"
                ]
        },
        "CollectionId": "u32",
        "TokenId": "u32",
        "ChainLimits": {
                "collectionNumbersLimit": "u32",
                "accountTokenOwnershipLimit": "u32",
                "collectionAdminsLimit": "u64",
                "customDataLimit": "u32",
                "nftSponsorTimeout": "u32",
                "fungibleSponsorTimeout": "u32",
                "refungibleSponsorTimeout": "u32",
                "offchainSchemaLimit": "u32",
                "variableOnChainSchemaLimit": "u32",
                "constOnChainSchemaLimit": "u32"
        },
        "CollectionLimits": {
                "accountTokenOwnershipLimit": "u32",
                "sponsoredDataSize": "u32",
                "sponsoredDataRateLimit": "Option<BlockNumber>",
                "tokenLimit": "u32",
                "sponsorTimeout": "u32",
                "ownerCanTransfer": "bool",
                "ownerCanDestroy": "bool"
        }
}`;

export default defaultNftTypes;
