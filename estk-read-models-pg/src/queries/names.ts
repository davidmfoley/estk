// @flow
export const tableName = ({
  name,
  version = 0
}: {
  name: string;
  version?: number;
}) => `${name}_${version}`;
export const metaTableName = ({
  name,
  version = 0
}: {
  name: string;
  version?: number;
}) => `_${name}_${version}_meta`;
