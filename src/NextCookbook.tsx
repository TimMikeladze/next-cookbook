import React, { useCallback, useMemo } from 'react';
import './NextCookbook.css';
import { useRouter } from 'next/router.js';
import Fuse from 'fuse.js';
import _Head from 'next/head.js';

export interface NextCookbookComponent {
  children: React.ReactNode | NextCookbookComponent[];
  description?: string;
  name: string;
}

export interface NextCookbookProps {
  Head?: React.ElementType;
  components: NextCookbookComponent[];
  defaultComponent?: string;
  fuseOptions?: Fuse.IFuseOptions<string>,
  useRouter?: () => any
}

const defaultFuseOptions = {
  keys: ['name'],
};

const sortAlphaNumerically = (a: string, b: string) => a.localeCompare(b, 'en', { numeric: true });

export const NextCookbook = (props: NextCookbookProps) => {
  const router = props.useRouter ? props.useRouter() : useRouter();
  const Head = props.Head || _Head;

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
    const map = new Map<string, React.ReactNode>();

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

  const content = (
    <>
      <div className="next-cookbook-toolbar" />
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
                    className={`next-cookbook-menu-item ${name === selectedComponent ? 'next-cookbook-menu-item-selected' : ''}`}
                    onClick={() => handleChangeSelected(name)}
                  >
                    {name}
                  </div>
                ))
              : props.components
                .sort((a, b) => sortAlphaNumerically(a.name, b.name))
                .map((item) => {
                  if (Array.isArray(item.children)) {
                    return (
                      <div className="next-cookbook-menu-group" key={item.name}>
                        <div className="next-cookbook-menu-group-name">
                          {item.name}
                        </div>
                        <div className="next-cookbook-menu-group-items">
                          {item.children
                            .sort((a, b) => sortAlphaNumerically(a.name, b.name))
                            .map((x) => (
                              <div
                                key={`${item.name}-${x.name}`}
                                className={`next-cookbook-menu-item ${`${item.name} - ${x.name}` === selectedComponent ? 'next-cookbook-menu-item-selected' : ''}`}
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
                      className={`next-cookbook-menu-item ${item.name === selectedComponent ? 'next-cookbook-menu-item-selected' : ''}`}
                      onClick={() => handleChangeSelected(item.name)}
                    >
                      {item.name}
                    </div>
                  );
                })}
          </div>
        </div>
        <div className="next-cookbook-component">
          {selectedComponent && data.map.get(selectedComponent)}
        </div>
      </div>
    </>
  );

  return (
    <div className="next-cookbook-root">
      <Head>
        <title>Next Cookbook</title>
      </Head>
      {error || content}
    </div>
  );
};
