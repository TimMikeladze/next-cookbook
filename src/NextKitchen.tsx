import React, { useMemo } from 'react';
import './NextKitchen.css';
import { useRouter } from 'next/router';

export interface NextKitchenComponent {
  children: React.ReactNode | NextKitchenComponent[];
  description?: string;
  name: string;
}

// export interface NextKitchenGroup {
//   components: NextKitchenComponent[];
//   description?: string;
//   name?: string;
// }

export interface NextKitchenConfig {
  components: NextKitchenComponent[];
  defaultComponent?: string;
}

export const NextKitchen = (config: NextKitchenConfig) => {
  const router = useRouter();

  const handleChangeSelected = (selectedComponent: string) => {
    router.push({
      pathname: router.pathname,
      query: {
        selectedComponent,
      },
    });
  };

  const selectedComponent = (router.query.selectedComponent as string) || config.defaultComponent;

  const res = useMemo(() => {
    const map = new Map();

    const array = config.components.flatMap((component) => {
      if (!Array.isArray(component.children)) {
        map.set(component.name, component.children);
      }

      return [
        component.name,
        ...(Array.isArray(component.children) ? component.children : []).map(
          (child) => {
            if (!Array.isArray(child.children)) {
              map.set(`${component.name}-${child.name}`, child.children);
            }

            return `${component.name}-${child.name}`;
          },
        ),
      ];
    });

    const hasDuplicates = new Set(array).size !== array.length;

    return {
      hasDuplicates,
      map,
    };
  }, [config.components]);

  if (res.hasDuplicates) {
    return (
      <div className="next-kitchen-root">
        <div className="next-kitchen-error">
          Duplicate component or group names detected. Please ensure that all
          names are unique.
        </div>
      </div>
    );
  }

  return (
    <div className="next-kitchen-root">
      <div className="next-kitchen-toolbar" />
      <div className="next-kitchen-main">
        <div className="next-kitchen-menu">
          {config.components
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item) => {
              if (Array.isArray(item.children)) {
                return (
                  <div className="next-kitchen-menu-group" key={item.name}>
                    <div className="next-kitchen-menu-group-name">
                      {item.name}
                    </div>
                    <div className="next-kitchen-menu-group-items">
                      {item.children
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((x) => (
                          <div
                            key={`${item.name}-${x.name}`}
                            className="next-kitchen-menu-item"
                            onClick={() => handleChangeSelected(`${item.name}-${x.name}`)}
                          >
                            {x.name}
                          </div>
                        ))}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={item.name}
                  className="next-kitchen-menu-item"
                  onClick={() => handleChangeSelected(item.name)}
                >
                  {item.name}
                </div>
              );
            })}
        </div>
        <div className="next-kitchen-component">
          {selectedComponent && res.map.get(selectedComponent)}
        </div>
      </div>
    </div>
  );
};
