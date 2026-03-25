declare module 'react-barcode' {
  import * as React from 'react';

  export interface BarcodeProps {
    value: string;
    format?:
      | 'CODE128'
      | 'CODE128A'
      | 'CODE128B'
      | 'CODE128C'
      | 'EAN13'
      | 'EAN8'
      | 'EAN5'
      | 'EAN2'
      | 'UPC'
      | 'UPCE'
      | 'ITF14'
      | 'ITF'
      | 'MSI'
      | 'MSI10'
      | 'MSI11'
      | 'MSI1010'
      | 'MSI1110'
      | 'pharmacode'
      | 'codabar';
    width?: number;
    height?: number;
    displayValue?: boolean;
    text?: string;
    fontOptions?: string;
    font?: string;
    textAlign?: string;
    textPosition?: string;
    textMargin?: number;
    fontSize?: number;
    background?: string;
    lineColor?: string;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
  }

  export default class Barcode extends React.Component<BarcodeProps> {}
}
