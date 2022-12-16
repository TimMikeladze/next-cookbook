import { NextCookbook } from 'next-cookbook';

import dynamic from 'next/dynamic';
import Button from '../components/Button';

const DynamicButton = dynamic(() => import('../components/Button'), {
  ssr: false,
});

const Page = () => (
  <NextCookbook
    defaultComponent="Button"
    components={[
      {
        name: 'A Button',
        children: <Button />,
      },
      ...Array(35)
        .fill(0)
        .map((_, i) => ({
          name: `Dynamic Button ${i + 1}`,
          children: <DynamicButton label={`Dynamic Button ${i + 1}`} />,
        })),
      {
        name: 'Group',
        children: [
          {
            name: 'Button 1',
            children: <Button label="Button 1 in a group" />,
          },
          {
            name: 'Button 2',
            children: <Button label="Button 2 in a group" />,
          },
        ],
      },
      {
        name: 'XYZ Button',
        children: <Button />,
      },
    ]}
  />
);

export default Page;
