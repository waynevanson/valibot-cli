import * as v from "valibot";
import { v7 as uuid } from "uuid";

export function parse(schema: unknown, args: ReadonlyArray<string>) {}

export type Id = string;

// schema + args
export interface ArgMatches extends IterableIterator<Id> {
  valid_args: Vec<Id>;
  valid_subcommands: Vec<Str>;
  args: FlatMap<Id, MatchedArg>;
  subcommand: Option<Box<SubCommand>>;
}

export interface FromArgsMatches {
  getOne(id: Id): string;
  getCount(id: Id): number;
  getFlag(id: Id): boolean;
  getMany(id: Id): Array<string>;
}

export type MatchedArg = unknown;
export type Box<T> = T;
export type SubCommand = unknown;
export type ValueParser = unknown;
export type StyledStr = string;
export type ArgAction = unknown;
export type Option<T> = T | null;
export type Str = string;
export type ArgFlags = unknown;
export type usize = number;
export type char = string;
export type OsStr = string;
export type OsString = string;
export type ArgPredicate = (value: unknown) => boolean;
export type ValueRange = unknown;
export type Extensions = unknown;
export type bool = boolean;
export type Vec<T> = ReadonlyArray<T>;

export interface Arg {
  id: Id;
  help: Option<StyledStr>;
  long_help: Option<StyledStr>;
  action: Option<ArgAction>;
  value_parser: Option<ValueParser>;
  blacklist: ReadonlyArray<Id>;
  settings: ArgFlags;
  overrides: ReadonlyArray<Id>;
  groups: ReadonlyArray<Id>;
  requires: ReadonlyArray<[ArgPredicate, Id]>;
  r_ifs: ReadonlyArray<[Id, OsStr]>;
  r_ifs_all: ReadonlyArray<[Id, OsStr]>;
  r_unless: ReadonlyArray<Id>;
  r_unless_all: ReadonlyArray<Id>;
  short: Option<char>;
  long: Option<Str>;
  aliases: ReadonlyArray<[Str, bool]>; // (name, visible)
  short_aliases: ReadonlyArray<[char, bool]>; // (name, visible)
  disp_ord: Option<usize>;
  val_names: ReadonlyArray<Str>;
  num_vals: Option<ValueRange>;
  val_delim: Option<char>;
  default_vals: ReadonlyArray<OsStr>;
  default_vals_ifs: ReadonlyArray<
    [Id, ArgPredicate, Option<ReadonlyArray<OsStr>>]
  >;
  default_missing_vals: ReadonlyArray<OsStr>;
  env: Option<[OsStr, Option<OsString>]>;
  terminator: Option<Str>;
  index: Option<usize>;
  help_heading: Option<Option<Str>>;
  ext: Extensions;
}

export interface FlatMap<K, V> {
  keys: Vec<K>;
  value: Vec<V>;
}

export interface Arguments {
  id: Id;
  args: Vec<Id>;
  required: bool;
  requires: Vec<Id>;
  conflicts: Vec<Id>;
  multiple: bool;
}

export type AppFlags = unknown;
export type MKeyMap = unknown;
export type ArgGroup = unknown;

export type DefferedInner = (command: Command) => Command;

export interface Command {
  name: Str;
  long_flag: Option<Str>;
  short_flag: Option<char>;
  display_name: Option<String>;
  bin_name: Option<String>;
  author: Option<Str>;
  version: Option<Str>;
  long_version: Option<Str>;
  about: Option<StyledStr>;
  long_about: Option<StyledStr>;
  before_help: Option<StyledStr>;
  before_long_help: Option<StyledStr>;
  after_help: Option<StyledStr>;
  after_long_help: Option<StyledStr>;
  aliases: Vec<[Str, bool]>; // (name, visible)
  short_flag_aliases: Vec<[char, bool]>; // (name, visible)
  long_flag_aliases: Vec<[Str, bool]>; // (name, visible)
  usage_str: Option<StyledStr>;
  usage_name: Option<String>;
  help_str: Option<StyledStr>;
  disp_ord: Option<usize>;
  template: Option<StyledStr>;
  settings: AppFlags;
  g_settings: AppFlags;
  args: MKeyMap;
  subcommands: Vec<Command>;
  groups: Vec<ArgGroup>;
  current_help_heading: Option<Str>;
  current_disp_ord: Option<usize>;
  subcommand_value_name: Option<Str>;
  subcommand_heading: Option<Str>;
  external_value_parser: Option<ValueParser>;
  long_help_exists: bool;
  deferred: Option<DefferedInner>;
  ext: Extensions;
}
