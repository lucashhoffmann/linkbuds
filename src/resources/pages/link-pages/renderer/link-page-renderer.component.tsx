import { LinkPageLayoutOne } from '../layouts/link-page-layout-one.component';
import { LinkPageLayoutThree } from '../layouts/link-page-layout-three.component';
import { LinkPageLayoutTwo } from '../layouts/link-page-layout-two.component';
import type { LinkPageRendererProps } from './link-page-renderer.types';

export function LinkPageRenderer(props: LinkPageRendererProps) {
  const horizontalLinks = props.linkPage.links.filter(
    (link) => link.active && link.placement === 'HORIZONTAL',
  );
  const verticalLinks = props.linkPage.links.filter(
    (link) => link.active && link.placement === 'VERTICAL',
  );

  switch (props.linkPage.layout) {
    case 'LAYOUT_2':
      return (
        <LinkPageLayoutTwo
          {...props}
          horizontalLinks={horizontalLinks}
          verticalLinks={verticalLinks}
        />
      );
    case 'LAYOUT_3':
      return (
        <LinkPageLayoutThree
          {...props}
          horizontalLinks={horizontalLinks}
          verticalLinks={verticalLinks}
        />
      );
    case 'LAYOUT_1':
    default:
      return (
        <LinkPageLayoutOne
          {...props}
          horizontalLinks={horizontalLinks}
          verticalLinks={verticalLinks}
        />
      );
  }
}
