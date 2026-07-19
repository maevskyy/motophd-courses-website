import type { ReactNode } from 'react';
import type { ServerFunctionClient } from 'payload';

import config from '@payload-config';
import '@payloadcms/next/css';
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts';

import { importMap } from './admin/importMap.js';
import './custom.scss';

const serverFunction: ServerFunctionClient = async (args) => {
  'use server';

  return handleServerFunctions({
    ...args,
    config,
    importMap
  });
};

type Args = {
  children: ReactNode;
};

export default function Layout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
