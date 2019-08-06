import { Component, Element, Prop, State, Event, EventEmitter, Watch, h } from '@stencil/core';

interface Icon {
  icon: string;
  label: string;
}

const icons: Icon[] = [
  {
    icon: '✌️',
    label: 'scissor',
  },
  {
    icon: '👋',
    label: 'paper',
  },
  {
    icon: '👊',
    label: 'rock',
  },
];

function getRandomIcon() {
  const index = Math.floor(Math.random() * Math.floor(icons.length));
  return icons[index];
}

@Component({
  tag: 'rock-paper-scissor',
  styleUrl: 'rock-paper-scissor.css',
})
export class RockPaperScissor {
  @Element() el: HTMLElement;

  @Prop() icon: Function;

  @State() currentIcon: Icon = getRandomIcon();
  @Event() iconChange: EventEmitter;

  @Watch('currentIcon')
  watchCurrentIcon(currentIcon) {
    this.iconChange.emit(currentIcon);
  }

  handleClick = () => {
    this.currentIcon = getRandomIcon();
  };

  render() {
    return (
      <div>
        <p>
          <amplify-button onClick={this.handleClick}>Play!</amplify-button>
        </p>
        <p>
          {this.icon ? (
            this.icon(this.currentIcon)
          ) : (
            <i class="icon" title={this.currentIcon.label}>
              {this.currentIcon.icon}
            </i>
          )}
        </p>
      </div>
    );
  }
}
