import { newSpecPage } from '@stencil/core/testing';
import { AmplifyField } from './amplify-field.tsx'

describe('amplify-field', () => {
  it('renders no label or description if none are provided', async () => {
    const page = await newSpecPage({
      components: [AmplifyField],
      html: `<amplify-field></amplify-field>`,
    });

    expect(page.root).toEqualHtml(
      `<amplify-field>
        <div>
          <div>
            <amplify-input type="text">
            </amplify-input>
          </div>
        </div>
      </amplify-field>`
    );
  });

  it('renders a label and description, if they are provided, and no id', async () => {
    const page = await newSpecPage({
      components: [AmplifyField],
      html: `<amplify-field label='label' description='description'></amplify-field>`,
    });

    expect(page.root).toEqualHtml(
      `<amplify-field description="description" label="label">
        <div>
          <label class="label">
            label
          </label>
          <div class="description" id="undefined-description">
            description
          </div>
          <div>
            <amplify-input type="text">
            </amplify-input>
          </div>
        </div>
      </amplify-field>`
    );
  });

  it('renders with an id, if it is provided', async () => {
    const page = await newSpecPage({
      components: [AmplifyField],
      html: `<amplify-field label='label' description='description' field-id='id'></amplify-field>`,
    });

    expect(page.root).toEqualHtml(
      `<amplify-field description="description" field-id="id" label="label">
        <div>
          <label class="label" htmlfor="id">
            label
          </label>
          <div class="description" id="id-description">
            description
          </div>
          <div>
            <amplify-input aria-describedby="id-description" fieldid="id" type="text">
            </amplify-input>
          </div>
        </div>
      </amplify-field>`
    );
  });
});
