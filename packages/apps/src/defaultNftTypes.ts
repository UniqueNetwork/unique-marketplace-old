// https://github.com/usetech-llc/nft_parachain#ui-custom-types
const defaultNftTypes = `{
  "Schedule": {
    "version": "u32",
    "put_code_per_byte_cost": "Gas",
    "grow_mem_cost": "Gas",
    "regular_op_cost": "Gas",
    "return_data_per_byte_cost": "Gas",
    "event_data_per_byte_cost": "Gas",
    "event_per_topic_cost": "Gas",
    "event_base_cost": "Gas",
    "call_base_cost": "Gas",
    "instantiate_base_cost": "Gas",
    "dispatch_base_cost": "Gas",
    "sandbox_data_read_cost": "Gas",
    "sandbox_data_write_cost": "Gas",
    "transfer_cost": "Gas",
    "instantiate_cost": "Gas",
    "max_event_topics": "u32",
    "max_stack_height": "u32",
    "max_memory_pages": "u32",
    "max_table_size": "u32",
    "enable_println": "bool",
    "max_subject_len": "u32"
  },
  "AccessMode": {
    "_enum": [
      "Normal",
      "WhiteList"
    ]
  },
  "CollectionMode": {
    "_enum": {
      "Invalid": null,
      "NFT": null,
      "Fungible": "u32",
      "ReFungible": "u32"
    }
  },
  "Ownership": {
    "Owner": "AccountId",
    "Fraction": "u128"
  },
  "FungibleItemType": {
    "Collection": "u64",
    "Owner": "AccountId",
    "Value": "u128"
  },
  "ReFungibleItemType": {
    "Collection": "u64",
    "Owner": "Vec<Ownership>",
    "Data": "Vec<u8>"
  },
  "NftItemType": {
    "Collection": "u64",
    "Owner": "AccountId",
    "ConstData": "Vec<u8>",
    "VariableData": "Vec<u8>"
  },
  "Ownership": {
    "owner": "AccountId",
    "fraction": "u128"
  },
  "ReFungibleItemType": {
    "Collection": "u64",
    "Owner": "Vec<Ownership<AccountId>>",
    "ConstData": "Vec<u8>",
    "VariableData": "Vec<u8>"
  },
  "CollectionType": {
    "Owner": "AccountId",
    "Mode": "CollectionMode",
    "Access": "AccessMode",
    "DecimalPoints": "u32",
    "Name": "Vec<u16>",
    "Description": "Vec<u16>",
    "TokenPrefix": "Vec<u8>",
    "MintMode": "bool",
    "OffchainSchema": "Vec<u8>",
    "Sponsor": "AccountId",
    "UnconfirmedSponsor": "AccountId",
    "VariableOnChainSchema": "Vec<u8>",
    "ConstOnChainSchema": "Vec<u8>"
  },
  "ApprovePermissions": {
    "Approved": "AccountId",
    "Amount": "u64"
  },
  "RawData": "Vec<u8>",
  "Address": "AccountId",
  "LookupSource": "AccountId",
  "Weight": "u64",
  "CreateNftData": {
    "const_data": "Vec<u8>",
    "variable_data": "Vec<u8>" 
  },
  "CreateFungibleData": {},
  "CreateReFungibleData": {
    "const_data": "Vec<u8>",
    "variable_data": "Vec<u8>" 
  },
  "CreateItemData": {
    "_enum": {
      "NFT": "CreateNftData",
      "Fungible": "CreateFungibleData",
      "ReFungible": "CreateReFungibleData"
    }
  }
}`;

export default defaultNftTypes;
