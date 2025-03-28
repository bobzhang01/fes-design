import { withInstall, withNoopInstall } from '../_util/withInstall';
import Descriptions from './descriptions';
import DescriptionsItem from './descriptionsItem';

import type { SFCWithInstall } from '../_util/interface';

type DescriptionsType = SFCWithInstall<typeof Descriptions>;
type DescriptionsItemType = SFCWithInstall<typeof DescriptionsItem>;

export const FDescriptions = withInstall<DescriptionsType>(
    Descriptions as DescriptionsType,
    {
        DescriptionsItem,
    },
);
export const FDescriptionsItem = withNoopInstall<DescriptionsItemType>(
    DescriptionsItem as DescriptionsItemType,
);

export default FDescriptions;
