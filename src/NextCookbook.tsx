import React, { useCallback, useMemo } from 'react';
import './NextCookbook.css';
import { useRouter } from 'next/router.js';
import Fuse from 'fuse.js';
import _Head from 'next/head.js';

export interface NextCookbookComponent {
  children: React.ReactNode | NextCookbookComponent[] | (() => React.ReactNode);
  description?: string;
  name: string;
}

export interface NextCookbookProps {
  components: NextCookbookComponent[];
  defaultComponent?: string;
  fuseOptions?: Fuse.IFuseOptions<string>;
  overrides?: {
    Head?: React.ElementType;
  };
  title?: string;
  toolbarActions?: React.ReactNode;
  useRouter?: () => any;
}

const defaultTitle = '🧑‍🍳📚 - Next Cookbook';

const defaultFuseOptions = {
  keys: ['name'],
};

export const defaultToolbarActions = (
  <a href="https://github.com/TimMikeladze/next-cookbook">
    <img
      alt="GitHub"
      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMGMtNi42MjYgMC0xMiA1LjM3My0xMiAxMiAwIDUuMzAyIDMuNDM4IDkuOCA4LjIwNyAxMS4zODcuNTk5LjExMS43OTMtLjI2MS43OTMtLjU3N3YtMi4yMzRjLTMuMzM4LjcyNi00LjAzMy0xLjQxNi00LjAzMy0xLjQxNi0uNTQ2LTEuMzg3LTEuMzMzLTEuNzU2LTEuMzMzLTEuNzU2LTEuMDg5LS43NDUuMDgzLS43MjkuMDgzLS43MjkgMS4yMDUuMDg0IDEuODM5IDEuMjM3IDEuODM5IDEuMjM3IDEuMDcgMS44MzQgMi44MDcgMS4zMDQgMy40OTIuOTk3LjEwNy0uNzc1LjQxOC0xLjMwNS43NjItMS42MDQtMi42NjUtLjMwNS01LjQ2Ny0xLjMzNC01LjQ2Ny01LjkzMSAwLTEuMzExLjQ2OS0yLjM4MSAxLjIzNi0zLjIyMS0uMTI0LS4zMDMtLjUzNS0xLjUyNC4xMTctMy4xNzYgMCAwIDEuMDA4LS4zMjIgMy4zMDEgMS4yMy45NTctLjI2NiAxLjk4My0uMzk5IDMuMDAzLS40MDQgMS4wMi4wMDUgMi4wNDcuMTM4IDMuMDA2LjQwNCAyLjI5MS0xLjU1MiAzLjI5Ny0xLjIzIDMuMjk3LTEuMjMuNjUzIDEuNjUzLjI0MiAyLjg3NC4xMTggMy4xNzYuNzcuODQgMS4yMzUgMS45MTEgMS4yMzUgMy4yMjEgMCA0LjYwOS0yLjgwNyA1LjYyNC01LjQ3OSA1LjkyMS40My4zNzIuODIzIDEuMTAyLjgyMyAyLjIyMnYzLjI5M2MwIC4zMTkuMTkyLjY5NC44MDEuNTc2IDQuNzY1LTEuNTg5IDguMTk5LTYuMDg2IDguMTk5LTExLjM4NiAwLTYuNjI3LTUuMzczLTEyLTEyLTEyeiIvPjwvc3ZnPg=="
    />
  </a>
);

export const sortAlphaNumerically = (a: string, b: string) => a.localeCompare(b, 'en', { numeric: true });

export const NextCookbook = (props: NextCookbookProps) => {
  const router = props.useRouter ? props.useRouter() : useRouter();
  const Head = props.overrides?.Head || _Head;

  const [searchResults, setSearchResults] = React.useState<string[] | null>(
    null,
  );

  const handleChangeSelected = useCallback((selectedComponent: string) => {
    router.push({
      pathname: router.pathname,
      query: {
        selectedComponent,
      },
    });
  }, []);

  const selectedComponent = (router.query.selectedComponent as string) || props.defaultComponent;

  const data = useMemo(() => {
    const map = new Map<string, React.ReactNode |(() => React.ReactNode)>();

    const array = props.components.flatMap((component) => {
      if (!Array.isArray(component.children)) {
        map.set(component.name, component.children);
      }

      return [
        component.name,
        ...(Array.isArray(component.children) ? component.children : []).map(
          (child) => {
            if (!Array.isArray(child.children)) {
              map.set(`${component.name} - ${child.name}`, child.children);
            }

            return `${component.name} - ${child.name}`;
          },
        ),
      ];
    });

    const hasDuplicates = new Set(array).size !== array.length;

    return {
      hasDuplicates,
      map,
    };
  }, [props.components]);

  const fuse = useMemo(
    () => new Fuse(Array.from(data.map.keys()), {
      ...defaultFuseOptions,
      ...props.fuseOptions,
    }),
    [props.components, props.fuseOptions],
  );

  const handleSearch = useCallback((text: string) => {
    if (!text.trim().length) {
      setSearchResults(null);
    } else {
      setSearchResults(fuse.search(text).map((x) => x.item));
    }
  }, []);

  let error;

  if (data.hasDuplicates) {
    error = (
      <div className="next-cookbook-root">
        <div className="next-cookbook-error">
          Duplicate component or group names detected. Please ensure that all
          names are unique.
        </div>
      </div>
    );
  }

  const renderSelectedComponent = (key: string) => {
    const children = data.map.get(key);

    // check if react render function
    if (typeof children === 'function') {
      return null;
    }

    return children;
  };

  const content = (
    <div className="next-cookbook-main">
      <div className="next-cookbook-menu">
        <input
          className="next-cookbook-search"
          placeholder="Search...
            "
          onChange={(e) => handleSearch(e.target.value)}
        />
        <div className="next-cookbook-menu-items">
          {Array.isArray(searchResults)
            ? Array.from(data.map.keys())
              .filter((searchResult) => searchResults.includes(searchResult))
              .map((name) => (
                <div
                  key={name}
                  className={`next-cookbook-menu-item ${
                    name === selectedComponent
                      ? 'next-cookbook-menu-item-selected'
                      : ''
                  }`}
                  onClick={() => handleChangeSelected(name)}
                >
                  {name}
                </div>
              ))
            : props.components.map((item) => {
              if (Array.isArray(item.children)) {
                return (
                  <div className="next-cookbook-menu-group" key={item.name}>
                    <div className="next-cookbook-menu-group-name">
                      {item.name}
                    </div>
                    <div className="next-cookbook-menu-group-items">
                      {item.children.map((x) => (
                        <div
                          key={`${item.name}-${x.name}`}
                          className={`next-cookbook-menu-item ${
                            `${item.name} - ${x.name}` === selectedComponent
                              ? 'next-cookbook-menu-item-selected'
                              : ''
                          }`}
                          onClick={() => handleChangeSelected(`${item.name} - ${x.name}`)}
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
                  className={`next-cookbook-menu-item ${
                    item.name === selectedComponent
                      ? 'next-cookbook-menu-item-selected'
                      : ''
                  }`}
                  onClick={() => handleChangeSelected(item.name)}
                >
                  {item.name}
                </div>
              );
            })}
        </div>
      </div>
      <div className="next-cookbook-content">
        <div className="next-cookbook-toolbar">
          <div className="next-cookbook-toolbar-actions">
            {props.toolbarActions || defaultToolbarActions}
          </div>
        </div>
        <div className="next-cookbook-component">
          {selectedComponent && renderSelectedComponent(selectedComponent)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="next-cookbook-root">
      <Head>
        <title>{props.title || defaultTitle}</title>
      </Head>
      {error || content}
    </div>
  );
};
