import React, { Component, createRef, CSSProperties } from 'react';
import loadPostcode, { PostcodeConstructor, PostcodeOptions, postcodeScriptUrl } from './loadPostcode';

export interface DaumPostcodeEmbedProps
  extends Omit<PostcodeOptions, 'oncomplete' | 'onresize' | 'onclose' | 'onsearch' | 'width' | 'height'> {
  onComplete?: PostcodeOptions['oncomplete'];
  onResize?: PostcodeOptions['onresize'];
  onClose?: PostcodeOptions['onclose'];
  onSearch?: PostcodeOptions['onsearch'];
  className?: string;
  style?: CSSProperties;
  defaultQuery?: string;
  errorMessage?: string | React.ReactNode;
  scriptUrl?: string;
  autoClose?: boolean;
}
/**
 * @deprecated
 * type 'DaumPostcodeProps' is renamed to 'DaumPostcodeEmbedProps'.
 * use 'DaumPostcodeEmbedProps' instead of 'DaumPostcodeProps'.
 * it will be removed future version.
 */
export type DaumPostcodeProps = DaumPostcodeEmbedProps;

interface State {
  hasError: boolean;
}

const defaultErrorMessage = <p>현재 Daum 우편번호 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.</p>;

const defaultStyle = {
  width: '100%',
  height: 400,
};

const defaultProps = {
  scriptUrl: postcodeScriptUrl,
  errorMessage: defaultErrorMessage,
  autoClose: true,
};

class DaumPostcodeEmbed extends Component<DaumPostcodeEmbedProps, State> {
  static defaultProps = defaultProps;
  /**
   * See #61
   */
  private mounted = false;

  wrap = createRef<HTMLDivElement>();

  state = {
    hasError: false,
  };

  componentDidMount() {
    const { initiate, onError } = this;
    const { scriptUrl } = this.props;

    if (!scriptUrl) return;
    if (!this.mounted) {
      loadPostcode(scriptUrl).then(initiate).catch(onError);
      this.mounted = true;
    }
  }

  initiate = (Postcode: PostcodeConstructor) => {
    if (!this.wrap.current) return;
    const { scriptUrl, className, style, defaultQuery, autoClose, errorMessage, onComplete, onClose, onResize, onSearch, ...options } =
      this.props;

    const postcode = new Postcode({
      ...options,
      oncomplete: (address) => {
        if (onComplete) onComplete(address);
        if (autoClose && this.wrap.current) this.wrap.current.remove();
      },
      onsearch: onSearch,
      onresize: onResize,
      onclose: onClose,
      width: '100%',
      height: '100%',
    });

    postcode.embed(this.wrap.current, { q: defaultQuery, autoClose: autoClose });
  };

  onError = (e: unknown) => {
    console.error(e);
    this.setState({ hasError: true });
  };

  render() {
    const { className, style, errorMessage } = this.props;
    const { hasError } = this.state;

    return (
      <div ref={this.wrap} className={className} style={{ ...defaultStyle, ...style }}>
        {hasError && errorMessage}
      </div>
    );
  }
}

export default DaumPostcodeEmbed;
